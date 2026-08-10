/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Edge Detection Module
 */

import { AnalysisSettings } from './types';

export interface EdgeDetectionResult {
  binaryEdgeMap: Uint8Array; // 1 for edge, 0 for background
  width: number;
  height: number;
  edgeCount: number;
  edgeImageData: ImageData; // Renderable ImageData
}

/**
 * Sobel Operator Edge Detection on ImageData
 */
export function detectEdges(
  imageData: ImageData,
  settings: AnalysisSettings
): EdgeDetectionResult {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;

  // Convert image to 8-bit grayscale array
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < src.length; i += 4) {
    const idx = i / 4;
    gray[idx] = Math.round(0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]);
  }

  // Noise reduction: 3x3 Gaussian blur filter if noiseReduction > 0
  let blurred = gray;
  if (settings.noiseReduction > 0) {
    blurred = new Uint8Array(width * height);
    const kernel = [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1
    ];
    const kSum = 16;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        let ki = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const px = gray[(y + dy) * width + (x + dx)];
            sum += px * kernel[ki++];
          }
        }
        blurred[y * width + x] = Math.round(sum / kSum);
      }
    }
  }

  const binaryEdgeMap = new Uint8Array(width * height);
  const edgeImageData = new ImageData(width, height);
  const dst = edgeImageData.data;

  // Sobel Kernels & Color Gradient Magnitude
  const baseThreshold = settings.threshold;
  const strokeDensity = settings.strokeDensity ?? 6;
  const densityScale = Math.max(0.4, strokeDensity / 6);
  const effectiveThreshold = Math.max(8, (baseThreshold - (10 - settings.edgeSensitivity) * 14) / densityScale);

  let edgeCount = 0;
  const borderMargin = 6;

  for (let y = borderMargin; y < height - borderMargin; y++) {
    for (let x = borderMargin; x < width - borderMargin; x++) {
      const idx = y * width + x;

      // 3x3 Grayscale Sobel
      const p0 = blurred[(y - 1) * width + (x - 1)];
      const p1 = blurred[(y - 1) * width + x];
      const p2 = blurred[(y - 1) * width + (x + 1)];

      const p3 = blurred[y * width + (x - 1)];
      const p5 = blurred[y * width + (x + 1)];

      const p6 = blurred[(y + 1) * width + (x - 1)];
      const p7 = blurred[(y + 1) * width + x];
      const p8 = blurred[(y + 1) * width + (x + 1)];

      const gx = (-1 * p0) + (1 * p2) + (-2 * p3) + (2 * p5) + (-1 * p6) + (1 * p8);
      const gy = (-1 * p0) + (-2 * p1) + (-1 * p2) + (1 * p6) + (2 * p7) + (1 * p8);

      const grayMagnitude = Math.sqrt(gx * gx + gy * gy);

      // Color Space Gradient (detect colored text like RED, BLUE, etc. even if gray contrast is moderate)
      const pxIdx = idx * 4;
      const pxLeft = (idx - 1) * 4;
      const pxRight = (idx + 1) * 4;
      const pxTop = (idx - width) * 4;
      const pxBottom = (idx + width) * 4;

      const drX = src[pxRight] - src[pxLeft];
      const dgX = src[pxRight + 1] - src[pxLeft + 1];
      const dbX = src[pxRight + 2] - src[pxLeft + 2];

      const drY = src[pxBottom] - src[pxTop];
      const dgY = src[pxBottom + 1] - src[pxTop + 1];
      const dbY = src[pxBottom + 2] - src[pxTop + 2];

      const colorMagnitude = Math.sqrt(drX * drX + dgX * dgX + dbX * dbX + drY * drY + dgY * dgY + dbY * dbY) * 0.7;

      const combinedMagnitude = Math.max(grayMagnitude, colorMagnitude);

      if (combinedMagnitude > effectiveThreshold) {
        binaryEdgeMap[idx] = 1;
        edgeCount++;

        dst[pxIdx] = 0;
        dst[pxIdx + 1] = 0;
        dst[pxIdx + 2] = 0;
        dst[pxIdx + 3] = 255;
      } else {
        binaryEdgeMap[idx] = 0;
        dst[pxIdx] = 255;
        dst[pxIdx + 1] = 255;
        dst[pxIdx + 2] = 255;
        dst[pxIdx + 3] = 255;
      }
    }
  }

  return {
    binaryEdgeMap,
    width,
    height,
    edgeCount,
    edgeImageData
  };
}
