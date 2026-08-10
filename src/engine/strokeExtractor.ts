/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Stroke Extractor
 */

import { AnalysisSettings, Point, Stroke } from './types';

/**
 * Ramer-Douglas-Peucker line simplification algorithm
 */
function ramerDouglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  // Perpendicular distance from point p to line segment (p1, p2)
  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const recResults1 = ramerDouglasPeucker(points.slice(0, index + 1), epsilon);
    const recResults2 = ramerDouglasPeucker(points.slice(index), epsilon);
    return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
  } else {
    return [points[0], points[end]];
  }
}

function perpendicularDistance(p: Point, line1: Point, line2: Point): number {
  const dx = line2.x - line1.x;
  const dy = line2.y - line1.y;

  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - line1.x, p.y - line1.y);
  }

  const num = Math.abs(dy * p.x - dx * p.y + line2.x * line1.y - line2.y * line1.x);
  const den = Math.hypot(dx, dy);
  return num / den;
}

/**
 * Extracts discrete polylines (strokes) from skeleton binary pixel map
 */
export function extractStrokesFromSkeleton(
  skeletonMap: Uint8Array,
  width: number,
  height: number,
  settings: AnalysisSettings,
  originalImageData?: ImageData
): Stroke[] {
  const visited = new Uint8Array(width * height);
  const strokes: Stroke[] = [];
  let strokeIdCounter = 1;

  // 8-neighbor offsets
  const neighbors = [
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 }
  ];

  function getNeighborCount(x: number, y: number): number {
    let count = 0;
    for (const n of neighbors) {
      const nx = x + n.dx;
      const ny = y + n.dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (skeletonMap[ny * width + nx] === 1) count++;
      }
    }
    return count;
  }

  // 1. Find all endpoint pixels (neighbor count === 1) & junction pixels (neighbor count > 2)
  const startCandidates: { x: number; y: number; degree: number }[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (skeletonMap[idx] === 1) {
        const degree = getNeighborCount(x, y);
        if (degree === 1 || degree > 2) {
          startCandidates.push({ x, y, degree });
        }
      }
    }
  }

  // Sort candidates so endpoints (degree 1) are traced first
  startCandidates.sort((a, b) => a.degree - b.degree);

  // If no endpoints (e.g. pure loop like circle), pick any pixel
  if (startCandidates.length === 0) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (skeletonMap[y * width + x] === 1) {
          startCandidates.push({ x, y, degree: 2 });
        }
      }
    }
  }

  // Trace pixel chains
  for (const candidate of startCandidates) {
    const startIdx = candidate.y * width + candidate.x;
    if (visited[startIdx] === 1) continue;

    const rawPoints: Point[] = [];
    let currX = candidate.x;
    let currY = candidate.y;

    while (currX >= 0 && currX < width && currY >= 0 && currY < height) {
      const idx = currY * width + currX;
      if (visited[idx] === 1 && rawPoints.length > 0) break;

      visited[idx] = 1;
      rawPoints.push({ x: currX, y: currY, pressure: 1.0 });

      // Find unvisited neighbor
      let nextX = -1;
      let nextY = -1;

      for (const n of neighbors) {
        const nx = currX + n.dx;
        const ny = currY + n.dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (skeletonMap[nIdx] === 1 && visited[nIdx] === 0) {
            nextX = nx;
            nextY = ny;
            break;
          }
        }
      }

      if (nextX === -1) break;
      currX = nextX;
      currY = nextY;
    }

    const strokeDensity = settings.strokeDensity ?? 6;
    const densityScale = Math.max(0.3, strokeDensity / 6);
    const effectiveMinLen = Math.max(3, Math.round(settings.minStrokeLength / densityScale));
    const effectiveSimplification = Math.max(0.3, settings.strokeSimplification / densityScale);

    if (rawPoints.length < effectiveMinLen) continue;

    // Apply RDP simplification
    const simplified = ramerDouglasPeucker(rawPoints, effectiveSimplification);

    if (simplified.length < 2) continue;

    // Calculate stroke statistics
    let totalLen = 0;
    for (let i = 1; i < simplified.length; i++) {
      totalLen += Math.hypot(simplified[i].x - simplified[i - 1].x, simplified[i].y - simplified[i - 1].y);
    }

    if (totalLen < effectiveMinLen) continue;

    const startPt = simplified[0];
    const endPt = simplified[simplified.length - 1];
    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;
    const direction = (Math.atan2(dy, dx) * 180) / Math.PI;

    // Sample full RGB color from original image data at rawPoints
    let strokeColor = '#1e293b';
    let isColorFill = false;
    if (originalImageData && originalImageData.data) {
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let validSamples = 0;

      for (const p of rawPoints) {
        const px = Math.floor(Math.max(0, Math.min(width - 1, p.x)));
        const py = Math.floor(Math.max(0, Math.min(height - 1, p.y)));
        
        // Check 3x3 neighborhood around point for richest color
        let bestR = 30;
        let bestG = 41;
        let bestB = 59;
        let bestScore = -1;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = px + dx;
            const ny = py + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              const r = originalImageData.data[idx];
              const g = originalImageData.data[idx + 1];
              const b = originalImageData.data[idx + 2];
              const a = originalImageData.data[idx + 3];

              if (a > 50) {
                const brightness = r + g + b;
                if (brightness < 720) { // Exclude plain white background
                  const maxC = Math.max(r, g, b);
                  const minC = Math.min(r, g, b);
                  const saturation = maxC - minC;
                  // Score prioritizes vivid color saturation, then dark outlines over light grey
                  const score = saturation * 3.0 + (765 - brightness) * 0.4;
                  if (score > bestScore) {
                    bestScore = score;
                    bestR = r;
                    bestG = g;
                    bestB = b;
                  }
                }
              }
            }
          }
        }

        if (bestScore > -1) {
          sumR += bestR;
          sumG += bestG;
          sumB += bestB;
          validSamples++;
        }
      }

      if (validSamples > 0) {
        const avgR = Math.round(sumR / validSamples);
        const avgG = Math.round(sumG / validSamples);
        const avgB = Math.round(sumB / validSamples);
        const brightness = avgR + avgG + avgB;
        const maxC = Math.max(avgR, avgG, avgB);
        const minC = Math.min(avgR, avgG, avgB);
        const saturation = maxC - minC;

        // If dark line (text, ink outline, facial features), force deep pitch-black ink for maximum legibility
        if (brightness < 380 && saturation < 50) {
          strokeColor = '#0f172a';
        } else if (avgR > 130 && avgG < 90 && avgB < 90) { 
          // Vivid Red text/ink ($30,000)
          strokeColor = `rgb(${avgR}, ${Math.round(avgG * 0.3)}, ${Math.round(avgB * 0.3)})`;
        } else {
          strokeColor = `rgb(${avgR}, ${avgG}, ${avgB})`;
        }

        // Only classify as color fill if it is a wide saturated color area, NOT dark text or black outlines
        if (saturation > 32 && brightness > 300) {
          isColorFill = true;
        }
      }
    }

    // Determine stroke layer
    let layer: Stroke['layer'] = 'structure';
    if (totalLen > (width + height) * 0.35) {
      layer = 'outline';
    } else if (isColorFill) {
      layer = 'fill';
    } else if (totalLen < 60 || (strokeColor === '#0f172a' && totalLen < 130)) {
      // Text, numbers ($30,000), facial expressions, eyes, teeth
      layer = 'detail';
    }

    // Check if stroke is an unwanted outer frame border or vignette loop
    const minX = Math.min(...simplified.map(p => p.x));
    const maxX = Math.max(...simplified.map(p => p.x));
    const minY = Math.min(...simplified.map(p => p.y));
    const maxY = Math.max(...simplified.map(p => p.y));

    const bboxWidth = maxX - minX;
    const bboxHeight = maxY - minY;

    // Filter out strokes that hug the canvas border edges or cover almost the entire canvas as an outer frame
    const isBorderEdgeHugging = simplified.filter(p => p.x <= 12 || p.x >= width - 12 || p.y <= 12 || p.y >= height - 12).length > simplified.length * 0.4;
    const isEnclosingFrame = (bboxWidth > width * 0.82) && (bboxHeight > height * 0.82) && (totalLen > (width + height) * 1.5);

    if (isBorderEdgeHugging || isEnclosingFrame) {
      // Skip unwanted outer border / vignette loop
      continue;
    }

    const strokeWidthBase = Math.max(2, Math.round(settings.detailSensitivity * 0.8));
    const fillDensity = settings.fillDensity ?? 7;
    const finalWidth = layer === 'fill' 
      ? Math.max(2, Math.round(strokeWidthBase * (0.7 + fillDensity * 0.2))) 
      : (layer === 'detail' ? 2.5 : strokeWidthBase);

    strokes.push({
      id: `raster-stroke-${strokeIdCounter++}`,
      points: simplified,
      length: Math.round(totalLen),
      startPoint: startPt,
      endPoint: endPt,
      width: finalWidth,
      opacity: layer === 'fill' ? Math.min(0.88, 0.65 + fillDensity * 0.03) : 1.0,
      color: strokeColor,
      duration: 1,
      delay: 0,
      order: strokeIdCounter,
      layer,
      confidence: 0.88,
      direction,
      isClosed: Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y) < 10
    });
  }

  // 2. Generate Dense In-Fill Paint Hatching Strokes strictly bounded within Color Regions
  const fillDensity = settings.fillDensity ?? 7;
  if (originalImageData && originalImageData.data && fillDensity >= 3) {
    // Scan step based on fill density (3px to 10px)
    const yStep = Math.max(3, Math.round(14 - fillDensity * 1.1));
    const hatchWidth = Math.max(3, Math.round(yStep * 1.3));

    const data = originalImageData.data;

    // Helper to check if pixel is a boundary, white paper, light background, OR skin tone!
    const isBoundaryOrExcludedPixel = (r: number, g: number, b: number, a: number): boolean => {
      if (a < 50) return true; // transparent
      const brightness = r + g + b;
      
      // Black/dark outline boundary or text line
      if (brightness < 140) return true;
      
      // White paper, pale cream background, or light tint (brightness > 560)
      if (brightness > 560) return true;

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const saturation = maxC - minC;

      // Exclude low-saturation grey/paper tints (e.g. shadow on white paper)
      if (brightness > 450 && saturation < 28) return true;

      // Exclude Skin Tones / Flesh / Face Tones (Peach, Tan, Beige)
      // Skin tone formula: high red, moderate green, lower blue, r > g && g > b
      const isSkinTone = (r > 175 && g > 130 && b > 95 && r >= g && g >= b && (r - b) < 120 && brightness > 450);
      if (isSkinTone) return true;

      return false; // Valid solid color area to fill (e.g. blue sweater, pink shirt, yellow hair, brown table)
    };

    // Helper to check if pixel color matches the segment's color region family
    const isSameColorFamily = (r: number, g: number, b: number, refR: number, refG: number, refB: number): boolean => {
      const diff = Math.abs(r - refR) + Math.abs(g - refG) + Math.abs(b - refB);
      return diff < 100;
    };

    // Scan horizontal rows for color region fills
    for (let y = 10; y < height - 10; y += yStep) {
      let currentSeg: Point[] = [];
      let refR = 0, refG = 0, refB = 0;
      let segR = 0, segG = 0, segB = 0;
      let count = 0;

      for (let x = 10; x < width - 10; x += 2) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const isBoundary = isBoundaryOrExcludedPixel(r, g, b, a);

        if (!isBoundary) {
          if (currentSeg.length === 0) {
            // Start new fill segment
            refR = r;
            refG = g;
            refB = b;
            currentSeg.push({ x, y, pressure: 0.9 });
            segR = r; segG = g; segB = b; count = 1;
          } else {
            // Check if still inside same color region
            if (isSameColorFamily(r, g, b, refR, refG, refB)) {
              currentSeg.push({ x, y, pressure: 0.9 });
              segR += r; segG += g; segB += b; count++;
            } else {
              // Color region changed! Save previous segment and start new one
              if (currentSeg.length >= 4 && count > 0) {
                const trimmed = currentSeg.length > 8 ? currentSeg.slice(2, currentSeg.length - 2) : currentSeg;
                const avgR = Math.round(segR / count);
                const avgG = Math.round(segG / count);
                const avgB = Math.round(segB / count);
                const segBrightness = avgR + avgG + avgB;
                const segMax = Math.max(avgR, avgG, avgB);
                const segMin = Math.min(avgR, avgG, avgB);
                const segSat = segMax - segMin;
                const strokeLen = trimmed[trimmed.length - 1].x - trimmed[0].x;

                const isSkinSegment = (avgR > 170 && avgG > 125 && avgB > 90 && avgR >= avgG && avgG >= avgB && (avgR - avgB) < 120 && segBrightness > 440);
                const isPaperSegment = segBrightness > 540 || (segBrightness > 440 && segSat < 25);

                if (!isSkinSegment && !isPaperSegment && strokeLen >= 10) {
                  strokes.push({
                    id: `infill-stroke-${strokeIdCounter++}`,
                    points: trimmed,
                    length: Math.round(strokeLen),
                    startPoint: trimmed[0],
                    endPoint: trimmed[trimmed.length - 1],
                    width: hatchWidth,
                    opacity: Math.min(0.85, 0.65 + fillDensity * 0.02),
                    color: `rgb(${avgR}, ${avgG}, ${avgB})`,
                    duration: 1,
                    delay: 0,
                    order: strokeIdCounter,
                    layer: 'fill',
                    confidence: 0.88,
                    direction: 0,
                    isClosed: false
                  });
                }
              }
              currentSeg = [{ x, y, pressure: 0.9 }];
              refR = r; refG = g; refB = b;
              segR = r; segG = g; segB = b; count = 1;
            }
          }
        } else {
          // Hit outline boundary or white space! End segment immediately
          if (currentSeg.length >= 4 && count > 0) {
            const trimmed = currentSeg.length > 8 ? currentSeg.slice(2, currentSeg.length - 2) : currentSeg;
            const avgR = Math.round(segR / count);
            const avgG = Math.round(segG / count);
            const avgB = Math.round(segB / count);
            const segBrightness = avgR + avgG + avgB;
            const segMax = Math.max(avgR, avgG, avgB);
            const segMin = Math.min(avgR, avgG, avgB);
            const segSat = segMax - segMin;
            const strokeLen = trimmed[trimmed.length - 1].x - trimmed[0].x;

            const isSkinSegment = (avgR > 170 && avgG > 125 && avgB > 90 && avgR >= avgG && avgG >= avgB && (avgR - avgB) < 120 && segBrightness > 440);
            const isPaperSegment = segBrightness > 540 || (segBrightness > 440 && segSat < 25);

            if (!isSkinSegment && !isPaperSegment && strokeLen >= 10) {
              strokes.push({
                id: `infill-stroke-${strokeIdCounter++}`,
                points: trimmed,
                length: Math.round(strokeLen),
                startPoint: trimmed[0],
                endPoint: trimmed[trimmed.length - 1],
                width: hatchWidth,
                opacity: Math.min(0.85, 0.65 + fillDensity * 0.02),
                color: `rgb(${avgR}, ${avgG}, ${avgB})`,
                duration: 1,
                delay: 0,
                order: strokeIdCounter,
                layer: 'fill',
                confidence: 0.88,
                direction: 0,
                isClosed: false
              });
            }
          }
          currentSeg = [];
          segR = 0; segG = 0; segB = 0; count = 0;
        }
      }

      // End of row segment flush
      if (currentSeg.length >= 4 && count > 0) {
        const trimmed = currentSeg.length > 8 ? currentSeg.slice(2, currentSeg.length - 2) : currentSeg;
        const avgR = Math.round(segR / count);
        const avgG = Math.round(segG / count);
        const avgB = Math.round(segB / count);
        const segBrightness = avgR + avgG + avgB;
        const segMax = Math.max(avgR, avgG, avgB);
        const segMin = Math.min(avgR, avgG, avgB);
        const segSat = segMax - segMin;
        const strokeLen = trimmed[trimmed.length - 1].x - trimmed[0].x;

        const isSkinSegment = (avgR > 170 && avgG > 125 && avgB > 90 && avgR >= avgG && avgG >= avgB && (avgR - avgB) < 120 && segBrightness > 440);
        const isPaperSegment = segBrightness > 540 || (segBrightness > 440 && segSat < 25);

        if (!isSkinSegment && !isPaperSegment && strokeLen >= 10) {
          strokes.push({
            id: `infill-stroke-${strokeIdCounter++}`,
            points: trimmed,
            length: Math.round(strokeLen),
            startPoint: trimmed[0],
            endPoint: trimmed[trimmed.length - 1],
            width: hatchWidth,
            opacity: Math.min(0.85, 0.65 + fillDensity * 0.02),
            color: `rgb(${avgR}, ${avgG}, ${avgB})`,
            duration: 1,
            delay: 0,
            order: strokeIdCounter,
            layer: 'fill',
            confidence: 0.88,
            direction: 0,
            isClosed: false
          });
        }
      }
    }
  }

  return strokes;
}
