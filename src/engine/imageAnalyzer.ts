/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Image Analyzer & Preprocessor
 */

import { AnalysisSettings, Point, Stroke } from './types';

export interface ImageAnalysisResult {
  sourceType: 'raster' | 'svg';
  width: number;
  height: number;
  imageData?: ImageData;
  canvas?: HTMLCanvasElement;
  svgStrokes?: Stroke[];
}

/**
 * Parses an SVG XML string into discrete Stroke objects with sampled path points.
 */
export function parseSvgToStrokes(svgString: string, canvasWidth = 800, canvasHeight = 800): Stroke[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return [];

  // Determine SVG viewBox dimensions
  let viewBoxWidth = canvasWidth;
  let viewBoxHeight = canvasHeight;
  if (svgEl.hasAttribute('viewBox')) {
    const parts = svgEl.getAttribute('viewBox')!.trim().split(/[\s,]+/);
    if (parts.length >= 4) {
      viewBoxWidth = parseFloat(parts[2]) || canvasWidth;
      viewBoxHeight = parseFloat(parts[3]) || canvasHeight;
    }
  } else {
    viewBoxWidth = parseFloat(svgEl.getAttribute('width') || '') || canvasWidth;
    viewBoxHeight = parseFloat(svgEl.getAttribute('height') || '') || canvasHeight;
  }

  const scaleX = canvasWidth / viewBoxWidth;
  scaleY: canvasHeight / viewBoxHeight;
  const scaleY = canvasHeight / viewBoxHeight;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (canvasWidth - viewBoxWidth * scale) / 2;
  const offsetY = (canvasHeight - viewBoxHeight * scale) / 2;

  const strokes: Stroke[] = [];
  let strokeIdCounter = 1;

  // Find all drawable elements
  const elements = doc.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse');

  elements.forEach((el) => {
    let d = '';
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'path') {
      d = el.getAttribute('d') || '';
    } else if (tagName === 'line') {
      const x1 = parseFloat(el.getAttribute('x1') || '0');
      const y1 = parseFloat(el.getAttribute('y1') || '0');
      const x2 = parseFloat(el.getAttribute('x2') || '0');
      const y2 = parseFloat(el.getAttribute('y2') || '0');
      d = `M ${x1} ${y1} L ${x2} ${y2}`;
    } else if (tagName === 'polyline' || tagName === 'polygon') {
      const pointsAttr = el.getAttribute('points') || '';
      const coords = pointsAttr.trim().split(/[\s,]+/).map(Number);
      if (coords.length >= 4) {
        d = `M ${coords[0]} ${coords[1]}`;
        for (let i = 2; i < coords.length; i += 2) {
          d += ` L ${coords[i]} ${coords[i + 1]}`;
        }
        if (tagName === 'polygon') d += ' Z';
      }
    } else if (tagName === 'rect') {
      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      const w = parseFloat(el.getAttribute('width') || '0');
      const h = parseFloat(el.getAttribute('height') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      if (w > 0 && h > 0) {
        if (rx > 0) {
          d = `M ${x + rx} ${y} L ${x + w - rx} ${y} A ${rx} ${rx} 0 0 1 ${x + w} ${y + rx} L ${x + w} ${y + h - rx} A ${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h} L ${x + rx} ${y + h} A ${rx} ${rx} 0 0 1 ${x} ${y + h - rx} L ${x} ${y + rx} A ${rx} ${rx} 0 0 1 ${x + rx} ${y} Z`;
        } else {
          d = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
        }
      }
    } else if (tagName === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const r = parseFloat(el.getAttribute('r') || '0');
      if (r > 0) {
        d = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
      }
    } else if (tagName === 'ellipse') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || '0');
      if (rx > 0 && ry > 0) {
        d = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
      }
    }

    if (!d) return;

    // Read attributes
    const svgEl = el as SVGElement;
    const strokeAttr = el.getAttribute('stroke') || svgEl.style?.stroke || '#000000';
    if (strokeAttr === 'none') return;

    const strokeWidthAttr = parseFloat(el.getAttribute('stroke-width') || svgEl.style?.strokeWidth || '3');
    const opacityAttr = parseFloat(el.getAttribute('opacity') || svgEl.style?.opacity || '1');

    // Create SVG path element in temporary offscreen doc to sample points
    try {
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', d);

      const totalLength = pathEl.getTotalLength();
      if (totalLength < 2) return;

      // Sample points along path
      const sampleStep = Math.max(3, Math.min(10, totalLength / 100));
      const points: Point[] = [];

      for (let s = 0; s <= totalLength; s += sampleStep) {
        const pt = pathEl.getPointAtLength(s);
        // Transform coordinates to target canvas
        const canvasX = pt.x * scale + offsetX;
        const canvasY = pt.y * scale + offsetY;
        points.push({ x: Math.round(canvasX * 10) / 10, y: Math.round(canvasY * 10) / 10, pressure: 1.0 });
      }

      // Add final point
      const lastPt = pathEl.getPointAtLength(totalLength);
      points.push({
        x: Math.round((lastPt.x * scale + offsetX) * 10) / 10,
        y: Math.round((lastPt.y * scale + offsetY) * 10) / 10,
        pressure: 1.0
      });

      if (points.length < 2) return;

      const startPoint = points[0];
      const endPoint = points[points.length - 1];
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const direction = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Classify layer
      let layer: Stroke['layer'] = 'structure';
      if (totalLength > (canvasWidth + canvasHeight) * 0.5) layer = 'outline';
      else if (totalLength < 30) layer = 'detail';

      strokes.push({
        id: `svg-stroke-${strokeIdCounter++}`,
        points,
        pathData: d,
        length: Math.round(totalLength * scale),
        startPoint,
        endPoint,
        width: Math.max(1, Math.round(strokeWidthAttr * scale)),
        opacity: opacityAttr,
        color: strokeAttr === 'none' || strokeAttr === 'transparent' ? '#1e293b' : strokeAttr,
        duration: 1,
        delay: 0,
        order: strokeIdCounter,
        layer,
        confidence: 0.98,
        direction,
        isClosed: d.toUpperCase().includes('Z')
      });
    } catch {
      // Fallback if browser doesn't support path length sampling offline
    }
  });

  return strokes;
}

/**
 * Preprocesses a raster image on offscreen Canvas according to user AnalysisSettings.
 */
export function preprocessRasterImage(
  image: HTMLImageElement | HTMLCanvasElement,
  settings: AnalysisSettings,
  targetWidth = 800,
  targetHeight = 800
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; imageData: ImageData } {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // Clear with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Calculate fit aspect ratio
  const aspect = image.width / image.height;
  let drawW = targetWidth;
  let drawH = targetHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (aspect > targetWidth / targetHeight) {
    drawH = targetWidth / aspect;
    offsetY = (targetHeight - drawH) / 2;
  } else {
    drawW = targetHeight * aspect;
    offsetX = (targetWidth - drawW) / 2;
  }

  // Draw image
  ctx.drawImage(image, offsetX, offsetY, drawW, drawH);

  // Read pixel data
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;

  const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));

  // Process pixels
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    // If transparent pixel, treat as white background
    if (a < 50) {
      r = 255;
      g = 255;
      b = 255;
    }

    // Apply brightness
    if (settings.brightness !== 0) {
      r = Math.min(255, Math.max(0, r + settings.brightness));
      g = Math.min(255, Math.max(0, g + settings.brightness));
      b = Math.min(255, Math.max(0, b + settings.brightness));
    }

    // Apply contrast
    if (settings.contrast !== 0) {
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
    }

    // Convert to Grayscale if requested
    if (settings.grayscale) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    if (settings.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }

  // Write preprocessed image back to canvas
  ctx.putImageData(imageData, 0, 0);

  return { canvas, ctx, imageData };
}
