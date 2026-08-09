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

  // Sobel Kernels
  // Gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
  // Gy = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]

  // Adjust sensitivity threshold
  const baseThreshold = settings.threshold; // default e.g. 128
  const sensitivityScale = (11 - settings.edgeSensitivity) * 12; // lower sensitivity scale = lower threshold = detect more subtle edges
  const effectiveThreshold = Math.max(15, baseThreshold - (10 - settings.edgeSensitivity) * 15);

  let edgeCount = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

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

      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (magnitude > effectiveThreshold) {
        binaryEdgeMap[idx] = 1;
        edgeCount++;

        // Edge visualization in canvas format (black line on white bg or white line on black bg)
        const imgIdx = idx * 4;
        dst[imgIdx] = 0;
        dst[imgIdx + 1] = 0;
        dst[imgIdx + 2] = 0;
        dst[imgIdx + 3] = 255;
      } else {
        binaryEdgeMap[idx] = 0;
        const imgIdx = idx * 4;
        dst[imgIdx] = 255;
        dst[imgIdx + 1] = 255;
        dst[imgIdx + 2] = 255;
        dst[imgIdx + 3] = 255;
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
