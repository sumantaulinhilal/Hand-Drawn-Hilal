/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Stroke Organizer & Order Optimizer
 */

import { DrawingSettings, Stroke } from './types';

/**
 * Organizes strokes into a logical, human-like drawing sequence.
 */
export function organizeStrokes(
  strokes: Stroke[],
  settings: DrawingSettings,
  canvasWidth = 800,
  canvasHeight = 800
): Stroke[] {
  if (strokes.length <= 1) return strokes;

  // Clone strokes array
  const remaining = [...strokes];

  // 1. Assign Layer priority scores if not present
  remaining.forEach((s) => {
    let score = 50;
    if (s.layer === 'outline') score = 10;
    else if (s.layer === 'structure') score = 20;
    else if (s.layer === 'detail') score = 70;
    else if (s.layer === 'shading' || s.layer === 'fill') score = 90;

    // Longer strokes usually drawn first
    score -= Math.min(20, s.length / 50);
    s.order = score;
  });

  // Sort initially by priority layer & length
  remaining.sort((a, b) => a.order - b.order);

  if (settings.strokeOrderPriority === 'length') {
    remaining.sort((a, b) => b.length - a.length);
  } else if (settings.strokeOrderPriority === 'top-down') {
    remaining.sort((a, b) => a.startPoint.y - b.startPoint.y);
  } else if (settings.strokeOrderPriority === 'outside-in') {
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    remaining.sort((a, b) => {
      const distA = Math.hypot(a.startPoint.x - cx, a.startPoint.y - cy);
      const distB = Math.hypot(b.startPoint.x - cx, b.startPoint.y - cy);
      return distB - distA;
    });
  }

  // Smart natural hand movement ordering (Nearest-Neighbor Traveling Salesperson path)
  if (settings.strokeOrderPriority === 'smart') {
    const ordered: Stroke[] = [];

    // Pick first stroke (longest main structural outline)
    let current = remaining.shift()!;
    ordered.push(current);

    while (remaining.length > 0) {
      const currentEnd = current.endPoint;

      let nearestIdx = -1;
      let minDistance = Infinity;
      let shouldReverseNext = false;

      // Find nearest next stroke start OR end point
      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        // Distance from current end to candidate start
        const dStart = Math.hypot(candidate.startPoint.x - currentEnd.x, candidate.startPoint.y - currentEnd.y);
        // Distance from current end to candidate end (if reversed)
        const dEnd = Math.hypot(candidate.endPoint.x - currentEnd.x, candidate.endPoint.y - currentEnd.y);

        // Weigh layer importance so outlines still take precedence over tiny details
        const layerPenalty = candidate.layer === 'detail' ? 40 : candidate.layer === 'shading' ? 80 : 0;

        const effectiveDStart = dStart + layerPenalty;
        const effectiveDEnd = dEnd + layerPenalty;

        if (effectiveDStart < minDistance) {
          minDistance = effectiveDStart;
          nearestIdx = i;
          shouldReverseNext = false;
        }

        if (effectiveDEnd < minDistance) {
          minDistance = effectiveDEnd;
          nearestIdx = i;
          shouldReverseNext = true;
        }
      }

      if (nearestIdx !== -1) {
        const nextStroke = remaining.splice(nearestIdx, 1)[0];

        // If reversing next stroke makes hand movement continuous, reverse points!
        if (shouldReverseNext) {
          nextStroke.points.reverse();
          const tempPt = nextStroke.startPoint;
          nextStroke.startPoint = nextStroke.endPoint;
          nextStroke.endPoint = tempPt;
          nextStroke.direction = (nextStroke.direction + 180) % 360;
        }

        current = nextStroke;
        ordered.push(current);
      } else {
        break;
      }
    }

    // Re-index order numbers
    return ordered.map((s, idx) => ({ ...s, order: idx + 1 }));
  }

  return remaining.map((s, idx) => ({ ...s, order: idx + 1 }));
}
