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
  settings: AnalysisSettings
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

    if (rawPoints.length < settings.minStrokeLength) continue;

    // Apply RDP simplification
    const simplified = ramerDouglasPeucker(rawPoints, settings.strokeSimplification);

    if (simplified.length < 2) continue;

    // Calculate stroke statistics
    let totalLen = 0;
    for (let i = 1; i < simplified.length; i++) {
      totalLen += Math.hypot(simplified[i].x - simplified[i - 1].x, simplified[i].y - simplified[i - 1].y);
    }

    if (totalLen < settings.minStrokeLength) continue;

    const startPt = simplified[0];
    const endPt = simplified[simplified.length - 1];
    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;
    const direction = (Math.atan2(dy, dx) * 180) / Math.PI;

    // Determine stroke layer
    let layer: Stroke['layer'] = 'structure';
    if (totalLen > (width + height) * 0.4) layer = 'outline';
    else if (totalLen < 25) layer = 'detail';

    strokes.push({
      id: `raster-stroke-${strokeIdCounter++}`,
      points: simplified,
      length: Math.round(totalLen),
      startPoint: startPt,
      endPoint: endPt,
      width: Math.max(1, Math.round(settings.detailSensitivity * 0.8)),
      opacity: 0.95,
      color: '#1e293b',
      duration: 1,
      delay: 0,
      order: strokeIdCounter,
      layer,
      confidence: 0.88,
      direction,
      isClosed: Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y) < 10
    });
  }

  return strokes;
}
