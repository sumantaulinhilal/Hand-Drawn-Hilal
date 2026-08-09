/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Skeletonization (Zhang-Suen Thinning)
 */

export interface SkeletonResult {
  skeletonMap: Uint8Array; // 1 for skeleton pixel, 0 for background
  width: number;
  height: number;
  pixelCount: number;
  skeletonImageData: ImageData;
}

/**
 * Zhang-Suen Thinning Algorithm
 * Reduces binary edge maps to 1-pixel wide continuous centerline skeletons.
 */
export function skeletonize(
  binaryMap: Uint8Array,
  width: number,
  height: number,
  maxIterations = 20
): SkeletonResult {
  const grid = new Uint8Array(binaryMap);
  let iterations = 0;
  let hasChanged = true;

  const toDelete: number[] = [];

  // Helper to count 0 -> 1 transitions in 8-neighborhood ordered P2..P9..P2
  function countTransitions(p2: number, p3: number, p4: number, p5: number, p6: number, p7: number, p8: number, p9: number): number {
    let count = 0;
    if (p2 === 0 && p3 === 1) count++;
    if (p3 === 0 && p4 === 1) count++;
    if (p4 === 0 && p5 === 1) count++;
    if (p5 === 0 && p6 === 1) count++;
    if (p6 === 0 && p7 === 1) count++;
    if (p7 === 0 && p8 === 1) count++;
    if (p8 === 0 && p9 === 1) count++;
    if (p9 === 0 && p2 === 1) count++;
    return count;
  }

  while (hasChanged && iterations < maxIterations) {
    hasChanged = false;
    iterations++;

    // --- Sub-iteration 1 ---
    toDelete.length = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (grid[idx] !== 1) continue;

        const p2 = grid[(y - 1) * width + x];
        const p3 = grid[(y - 1) * width + (x + 1)];
        const p4 = grid[y * width + (x + 1)];
        const p5 = grid[(y + 1) * width + (x + 1)];
        const p6 = grid[(y + 1) * width + x];
        const p7 = grid[(y + 1) * width + (x - 1)];
        const p8 = grid[y * width + (x - 1)];
        const p9 = grid[(y - 1) * width + (x - 1)];

        const n = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        const s = countTransitions(p2, p3, p4, p5, p6, p7, p8, p9);

        if (n >= 2 && n <= 6 && s === 1) {
          if (p2 * p4 * p6 === 0 && p4 * p6 * p8 === 0) {
            toDelete.push(idx);
          }
        }
      }
    }

    if (toDelete.length > 0) {
      hasChanged = true;
      for (let i = 0; i < toDelete.length; i++) {
        grid[toDelete[i]] = 0;
      }
    }

    // --- Sub-iteration 2 ---
    toDelete.length = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (grid[idx] !== 1) continue;

        const p2 = grid[(y - 1) * width + x];
        const p3 = grid[(y - 1) * width + (x + 1)];
        const p4 = grid[y * width + (x + 1)];
        const p5 = grid[(y + 1) * width + (x + 1)];
        const p6 = grid[(y + 1) * width + x];
        const p7 = grid[(y + 1) * width + (x - 1)];
        const p8 = grid[y * width + (x - 1)];
        const p9 = grid[(y - 1) * width + (x - 1)];

        const n = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        const s = countTransitions(p2, p3, p4, p5, p6, p7, p8, p9);

        if (n >= 2 && n <= 6 && s === 1) {
          if (p2 * p4 * p8 === 0 && p2 * p6 * p8 === 0) {
            toDelete.push(idx);
          }
        }
      }
    }

    if (toDelete.length > 0) {
      hasChanged = true;
      for (let i = 0; i < toDelete.length; i++) {
        grid[toDelete[i]] = 0;
      }
    }
  }

  // Count skeleton pixels & construct visualization image
  let pixelCount = 0;
  const skeletonImageData = new ImageData(width, height);
  const data = skeletonImageData.data;

  for (let i = 0; i < grid.length; i++) {
    const imgIdx = i * 4;
    if (grid[i] === 1) {
      pixelCount++;
      data[imgIdx] = 16;
      data[imgIdx + 1] = 185;
      data[imgIdx + 2] = 129; // Emerald green skeleton lines
      data[imgIdx + 3] = 255;
    } else {
      data[imgIdx] = 255;
      data[imgIdx + 1] = 255;
      data[imgIdx + 2] = 255;
      data[imgIdx + 3] = 0;
    }
  }

  return {
    skeletonMap: grid,
    width,
    height,
    pixelCount,
    skeletonImageData
  };
}
