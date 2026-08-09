/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Stroke Optimizer & Path Smoother
 */

import { DrawingSettings, Point, Stroke } from './types';

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
  // 1. Smooth path points
  let processedPoints = smoothPoints(stroke.points, settings.smoothness);

  // 2. Add subtle human hand jitter if jitter > 0
  if (settings.handJitter > 0) {
    const jitterFactor = settings.handJitter * 0.4;
    processedPoints = processedPoints.map((pt, idx) => {
      // Keep start and end points anchored for clean joins
      if (idx === 0 || idx === processedPoints.length - 1) return pt;

      const noiseX = (Math.random() - 0.5) * jitterFactor;
      const noiseY = (Math.random() - 0.5) * jitterFactor;
      return {
        x: pt.x + noiseX,
        y: pt.y + noiseY,
        pressure: pt.pressure
      };
    });
  }

  // 3. Pressure dynamics: simulated pen pressure tapering at start/end, heavier in middle
  if (settings.pressureVariation > 0) {
    const totalPts = processedPoints.length;
    processedPoints = processedPoints.map((pt, idx) => {
      const progress = idx / (totalPts - 1 || 1);
      // Sine curve pressure tapering at ends
      const pressureMult = Math.sin(progress * Math.PI) * settings.pressureVariation + (1 - settings.pressureVariation);
      return {
        ...pt,
        pressure: Math.max(0.2, Math.min(1.5, pressureMult))
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
