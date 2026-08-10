/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Animation State & Timing Engine
 */

import { AnimationSettings, Point, Stroke } from './types';

export interface ActiveStrokeState {
  stroke: Stroke;
  progress: number; // 0.0 to 1.0
  visiblePoints: Point[];
  currentTipPoint: Point;
  penAngle: number; // in degrees
  isDrawing: boolean;
  isComplete: boolean;
}

export interface AnimationFrameState {
  currentTime: number; // current playback time in seconds
  totalDuration: number;
  overallProgress: number; // 0.0 to 1.0
  drawingProgress: number; // 0.0 to 1.0 (reaches 1.0 when all strokes finish drawing, before endDelay hold)
  activeStrokes: ActiveStrokeState[];
  completedStrokes: Stroke[];
  isComplete: boolean;
}

/**
 * Calculates start time and duration for each stroke in project timeline
 */
export function calculateTimelineSchedule(
  strokes: Stroke[],
  animationSettings: AnimationSettings,
  drawingSpeedMultiplier = 1.0,
  concurrentStrokes = 1
): { scheduledStrokes: Stroke[]; computedTotalDuration: number } {
  if (strokes.length === 0) return { scheduledStrokes: [], computedTotalDuration: 0 };

  const speed = Math.max(0.1, drawingSpeedMultiplier);
  const targetDrawingDuration = Math.max(0.5, animationSettings.duration / speed);
  const startDelay = Math.max(0, animationSettings.startDelay);
  const endDelay = Math.max(0, animationSettings.endDelay);

  const totalLength = strokes.reduce((acc, s) => acc + s.length, 0);

  // Track active channels if concurrentStrokes > 1
  const channelTime: number[] = new Array(Math.max(1, concurrentStrokes)).fill(startDelay);

  const rawScheduled = strokes.map((s, idx) => {
    const rawDuration = (s.length / (totalLength || 1)) * targetDrawingDuration;
    const duration = Math.max(0.001, rawDuration);

    let chosenChannel = 0;
    let minChannelTime = channelTime[0];

    for (let c = 1; c < channelTime.length; c++) {
      if (channelTime[c] < minChannelTime) {
        minChannelTime = channelTime[c];
        chosenChannel = c;
      }
    }

    const startTime = channelTime[chosenChannel];
    const interStrokeDelay = Math.min(0.002, duration * 0.05);
    channelTime[chosenChannel] = startTime + duration + interStrokeDelay;

    return {
      ...s,
      order: idx + 1,
      delay: startTime,
      duration
    };
  });

  const maxEndTime = Math.max(...channelTime);
  const elapsedDrawing = maxEndTime - startDelay;
  const scaleFactor = (elapsedDrawing > 0 && targetDrawingDuration > 0) ? (targetDrawingDuration / elapsedDrawing) : 1.0;

  const scheduledStrokes = rawScheduled.map((s) => ({
    ...s,
    delay: startDelay + (s.delay - startDelay) * scaleFactor,
    duration: Math.max(0.001, s.duration * scaleFactor)
  }));

  const computedTotalDuration = startDelay + targetDrawingDuration + endDelay;

  return { scheduledStrokes, computedTotalDuration };
}

/**
 * Custom hand-drawn easing curve
 * Natural human hand drawing accelerates away from start, moves steadily, and decelerates near endpoint.
 */
export function applyEasing(rawProgress: number, easingType: AnimationSettings['easing']): number {
  const p = Math.max(0, Math.min(1, rawProgress));

  switch (easingType) {
    case 'linear':
      return p;
    case 'ease-in-out':
      return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    case 'cubic-bezier':
      return p * p * (3 - 2 * p);
    case 'natural-hand':
    default: {
      // Natural human velocity profile
      if (p < 0.2) {
        // Smooth acceleration
        return 2.5 * p * p;
      } else if (p > 0.8) {
        // Gentle deceleration
        const t = (p - 0.8) / 0.2;
        return 0.8 + 0.2 * (1 - Math.pow(1 - t, 2));
      } else {
        // Steady drawing speed
        return 0.1 + (p - 0.2) * 1.1666;
      }
    }
  }
}

/**
 * Calculates current frame state at given timestamp t
 */
export function evaluateAnimationFrame(
  t: number,
  scheduledStrokes: Stroke[],
  totalDuration: number,
  easingType: AnimationSettings['easing'] = 'natural-hand'
): AnimationFrameState {
  const currentTime = Math.max(0, Math.min(totalDuration, t));
  const overallProgress = totalDuration > 0 ? currentTime / totalDuration : 1;

  const activeStrokes: ActiveStrokeState[] = [];
  const completedStrokes: Stroke[] = [];

  for (const stroke of scheduledStrokes) {
    const startTime = stroke.delay;
    const endTime = stroke.delay + stroke.duration;

    if (currentTime >= endTime) {
      completedStrokes.push(stroke);
    } else if (currentTime >= startTime) {
      const rawProgress = (currentTime - startTime) / (stroke.duration || 1);
      const easedProgress = applyEasing(rawProgress, easingType);

      // Slice points based on eased progress
      const totalPoints = stroke.points.length;
      if (totalPoints === 0) continue;

      const targetPtCount = Math.max(1, Math.min(totalPoints, Math.ceil(easedProgress * totalPoints)));
      const visiblePoints = stroke.points.slice(0, targetPtCount);

      // Interpolate current tip point
      const tipIndex = Math.min(totalPoints - 1, Math.floor(easedProgress * (totalPoints - 1)));
      const nextIndex = Math.min(totalPoints - 1, tipIndex + 1);

      const p1 = stroke.points[tipIndex];
      const p2 = stroke.points[nextIndex];

      const subProgress = (easedProgress * (totalPoints - 1)) - tipIndex;
      const currentTipPoint: Point = {
        x: p1.x + (p2.x - p1.x) * subProgress,
        y: p1.y + (p2.y - p1.y) * subProgress,
        pressure: (p1.pressure || 1) + ((p2.pressure || 1) - (p1.pressure || 1)) * subProgress
      };

      // Calculate pen angle in degrees with multi-point smoothing to eliminate hand jitter
      const lookWindow = 4;
      const idxPrev = Math.max(0, tipIndex - lookWindow);
      const idxNext = Math.min(totalPoints - 1, tipIndex + lookWindow);
      const ptPrev = stroke.points[idxPrev];
      const ptNext = stroke.points[idxNext];

      const dx = ptNext.x - ptPrev.x;
      const dy = ptNext.y - ptPrev.y;
      let penAngle = stroke.direction;
      if (Math.hypot(dx, dy) > 0.5) {
        penAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      }

      activeStrokes.push({
        stroke,
        progress: easedProgress,
        visiblePoints: visiblePoints.length > 0 ? visiblePoints : [currentTipPoint],
        currentTipPoint,
        penAngle,
        isDrawing: true,
        isComplete: false
      });
    }
  }

  const maxStrokeEndTime = scheduledStrokes.length > 0 
    ? Math.max(...scheduledStrokes.map(s => s.delay + s.duration)) 
    : totalDuration;

  const drawingProgress = maxStrokeEndTime > 0 ? Math.min(1.0, currentTime / maxStrokeEndTime) : 1.0;

  return {
    currentTime,
    totalDuration,
    overallProgress,
    drawingProgress,
    activeStrokes,
    completedStrokes,
    isComplete: currentTime >= totalDuration
  };
}
