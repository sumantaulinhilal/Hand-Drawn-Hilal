/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Stroke Optimizer & Path Smoother
 */

import { DrawingSettings, Point, Stroke } from './types';

/**
 * Gaussian moving average filter to remove micro pixel jitter
 */
export function removePixelJitter(points: Point[]): Point[] {
  if (points.length <= 3) return points;
  const smoothed: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    smoothed.push({
      x: 0.22 * prev.x + 0.56 * curr.x + 0.22 * next.x,
      y: 0.22 * prev.y + 0.56 * curr.y + 0.22 * next.y,
      pressure: 0.22 * (prev.pressure || 1) + 0.56 * (curr.pressure || 1) + 0.22 * (next.pressure || 1)
    });
  }

  smoothed.push(points[points.length - 1]);
  return smoothed;
}

/**
 * Chaikin's corner cutting algorithm for path smoothing
 */
export function smoothPoints(points: Point[], iterations: number): Point[] {
  if (iterations <= 0 || points.length <= 2) return points;

  let current = points;
  for (let it = 0; it < iterations; it++) {
    const next: Point[] = [current[0]];
    for (let i = 0; i < current.length - 1; i++) {
      const p0 = current[i];
      const p1 = current[i + 1];

      const q = {
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
        pressure: 0.75 * (p0.pressure || 1) + 0.25 * (p1.pressure || 1)
      };

      const r = {
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
        pressure: 0.25 * (p0.pressure || 1) + 0.75 * (p1.pressure || 1)
      };

      next.push(q, r);
    }
    next.push(current[current.length - 1]);
    current = next;
  }
  return current;
}

/**
 * Injects subtle human hand jitter, natural pressure curves, and velocity variations.
 */
export function optimizeStroke(stroke: Stroke, settings: DrawingSettings): Stroke {
  // 1. First pass: Remove raw pixel staircase jitter
  let processedPoints = removePixelJitter(stroke.points);

  // 2. Second pass: Chaikin corner cutting smoothing
  const smoothPasses = Math.max(1, settings.smoothness || 3);
  processedPoints = smoothPoints(processedPoints, smoothPasses);

  // 3. Add subtle natural organic variation ONLY if jitter explicitly configured > 0
  if (settings.handJitter > 0) {
    const jitterFactor = settings.handJitter * 0.05;
    processedPoints = processedPoints.map((pt, idx) => {
      // Keep start and end points anchored for clean joins
      if (idx === 0 || idx === processedPoints.length - 1) return pt;

      const waveX = Math.sin(idx * 0.2) * jitterFactor;
      const waveY = Math.cos(idx * 0.2) * jitterFactor;
      return {
        x: pt.x + waveX,
        y: pt.y + waveY,
        pressure: pt.pressure
      };
    });
  }

  // 4. Pressure dynamics: simulated pen pressure tapering at start/end
  if (settings.pressureVariation > 0) {
    const totalPts = processedPoints.length;
    processedPoints = processedPoints.map((pt, idx) => {
      const progress = idx / (totalPts - 1 || 1);
      // Sine curve pressure tapering at ends
      const pressureMult = Math.sin(progress * Math.PI) * settings.pressureVariation + (1 - settings.pressureVariation);
      return {
        ...pt,
        pressure: Math.max(0.3, Math.min(1.4, pressureMult))
      };
    });
  }

  return {
    ...stroke,
    points: processedPoints,
    startPoint: processedPoints[0] || stroke.startPoint,
    endPoint: processedPoints[processedPoints.length - 1] || stroke.endPoint
  };
}
