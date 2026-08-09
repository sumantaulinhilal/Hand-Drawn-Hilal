/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Render Engine
 */

import { AnimationFrameState } from './animationEngine';
import { BackgroundSettings, DrawingSettings, DrawingStyleMode, Stroke, ViewSettings } from './types';

/**
 * Draws a realistic hand holding a pen/pencil/marker at (x, y)
 */
export function drawHandCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  handType: DrawingSettings['handType'] = 'pen'
) {
  ctx.save();
  ctx.translate(x, y);
  // Rotate hand slightly based on stroke direction
  const rotRad = (angle + 45) * (Math.PI / 180);
  ctx.rotate(rotRad * 0.25);

  // Pen body vector graphics offset
  ctx.save();
  ctx.rotate(-Math.PI / 4);

  if (handType === 'pencil') {
    // Hexagonal Yellow Pencil
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-4, -60, 8, 50);
    // Wood tip
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.moveTo(-4, -10);
    ctx.lineTo(4, -10);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    // Graphite tip
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(-1.5, -3.75);
    ctx.lineTo(1.5, -3.75);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    // Eraser band
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-4, -65, 8, 5);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-4, -72, 8, 7);
  } else if (handType === 'marker' || handType === 'whiteboard-marker') {
    // Thick Whiteboard / Permanent Marker Body
    ctx.fillStyle = handType === 'whiteboard-marker' ? '#0284c7' : '#0f172a';
    ctx.fillRect(-6, -70, 12, 60);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, -20, 12, 6);
    // Chisel tip
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-4, -10);
    ctx.lineTo(4, -10);
    ctx.lineTo(1, 0);
    ctx.lineTo(-2, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    // Elegant Black Fountain Pen
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-4, -75, 8, 65, [4, 4, 0, 0]);
    ctx.fill();
    // Gold clip & accent
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-4, -60, 8, 3);
    ctx.fillRect(2, -70, 2, 25);
    // Nib
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(-3, -10);
    ctx.lineTo(3, -10);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // Hand Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(25, 35, 18, 12, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Hand / Fingers Silhouette (Realistic hand overlay)
  ctx.fillStyle = '#fbcfe8'; // Soft skin tone
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 1.5;

  // Index finger gripping pen
  ctx.beginPath();
  ctx.ellipse(12, 18, 10, 16, Math.PI / 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Thumb gripping pen
  ctx.beginPath();
  ctx.ellipse(20, 28, 12, 18, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Knuckle / Palm arc
  ctx.beginPath();
  ctx.arc(38, 45, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Main Canvas Render Function
 */
export function renderCanvasFrame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  frameState: AnimationFrameState,
  styleMode: DrawingStyleMode,
  drawingSettings: DrawingSettings,
  backgroundSettings: BackgroundSettings,
  viewSettings: ViewSettings,
  originalImage?: HTMLImageElement | HTMLCanvasElement
) {
  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw Background
  if (backgroundSettings.type === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (backgroundSettings.type === 'black') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (backgroundSettings.type === 'grid') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  } else if (backgroundSettings.type === 'paper') {
    ctx.fillStyle = '#fef3c7'; // Cream paper color
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (backgroundSettings.type === 'custom') {
    ctx.fillStyle = backgroundSettings.customColor || '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 2. Draw Original Reference Image if enabled
  if (viewSettings.showOriginal && originalImage) {
    ctx.save();
    ctx.globalAlpha = backgroundSettings.originalOpacity;
    const aspect = originalImage.width / originalImage.height;
    let drawW = canvasWidth;
    let drawH = canvasHeight;
    let offX = 0;
    let offY = 0;
    if (aspect > canvasWidth / canvasHeight) {
      drawH = canvasWidth / aspect;
      offY = (canvasHeight - drawH) / 2;
    } else {
      drawW = canvasHeight * aspect;
      offX = (canvasWidth - drawW) / 2;
    }
    ctx.drawImage(originalImage, offX, offY, drawW, drawH);
    ctx.restore();
  }

  // 3. Helper to draw a single stroke given style settings
  const drawStrokeSegment = (
    stroke: Stroke,
    points: { x: number; y: number; pressure?: number }[],
    isComplete: boolean
  ) => {
    if (points.length < 2) return;

    ctx.save();
    const baseColor = stroke.color || '#1e293b';
    const baseWidth = (stroke.width || drawingSettings.strokeWidth) * (drawingSettings.strokeWidth / 3);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (styleMode === 'PENCIL_SKETCH') {
      // Textured graphite pencil effect
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.lineWidth = Math.max(1, baseWidth * 0.8);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Secondary sketch offset line for pencil feel
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = Math.max(0.8, baseWidth * 0.5);
      ctx.beginPath();
      ctx.moveTo(points[0].x + 0.8, points[0].y - 0.5);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x + 0.8, points[i].y - 0.5);
      }
      ctx.stroke();
    } else if (styleMode === 'MARKER') {
      // Bold marker with slight opacity overlap
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth * 1.8;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    } else if (styleMode === 'CLEAN_WHITEBOARD') {
      // Smooth whiteboard marker
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = baseColor === '#ffffff' ? '#2563eb' : baseColor;
      ctx.lineWidth = baseWidth * 1.4;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    } else if (styleMode === 'INK' || styleMode === 'REALISTIC_HAND' || styleMode === 'AUTO') {
      // Variable pressure ink stroke
      ctx.globalAlpha = stroke.opacity * drawingSettings.strokeOpacity;
      ctx.strokeStyle = baseColor;

      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const pressure = (p2.pressure || 1) * (drawingSettings.pressureVariation * 0.5 + 0.75);

        ctx.lineWidth = Math.max(1, baseWidth * pressure);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    } else {
      // VECTOR_PRECISE
      ctx.globalAlpha = stroke.opacity * drawingSettings.strokeOpacity;
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // 4. Render Completed Strokes
  for (const stroke of frameState.completedStrokes) {
    drawStrokeSegment(stroke, stroke.points, true);
  }

  // 5. Render Active Strokes
  for (const activeState of frameState.activeStrokes) {
    drawStrokeSegment(activeState.stroke, activeState.visiblePoints, false);
  }

  // 6. Render Drawing Path Debug Overlay if enabled
  if (viewSettings.showDrawingPath) {
    ctx.save();

    // Render all stroke paths with distinct color sequence
    const colorList = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    const allStrokes = [...frameState.completedStrokes, ...frameState.activeStrokes.map((a) => a.stroke)];

    allStrokes.forEach((stroke, idx) => {
      const isSelected = viewSettings.selectedStrokeId === stroke.id;
      const pathColor = isSelected ? '#eab308' : colorList[idx % colorList.length];

      // Draw vector stroke path
      ctx.strokeStyle = pathColor;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.setLineDash(isSelected ? [] : [4, 4]);

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let p = 1; p < stroke.points.length; p++) {
        ctx.lineTo(stroke.points[p].x, stroke.points[p].y);
      }
      ctx.stroke();

      // Start node handle (Green dot)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(stroke.startPoint.x, stroke.startPoint.y, isSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      // End node handle (Red square)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(stroke.endPoint.x - (isSelected ? 5 : 3), stroke.endPoint.y - (isSelected ? 5 : 3), isSelected ? 10 : 6, isSelected ? 10 : 6);

      // Stroke index badge
      if (viewSettings.showStrokeNumbers) {
        ctx.fillStyle = isSelected ? '#eab308' : '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        const midIdx = Math.floor(stroke.points.length / 2);
        const midPt = stroke.points[midIdx] || stroke.startPoint;
        ctx.fillText(`#${stroke.order || idx + 1}`, midPt.x + 6, midPt.y - 6);
      }
    });

    ctx.restore();
  }

  // 7. Render Active Hand Pen Cursors
  if (drawingSettings.showHandCursor) {
    for (const activeState of frameState.activeStrokes) {
      drawHandCursor(
        ctx,
        activeState.currentTipPoint.x,
        activeState.currentTipPoint.y,
        activeState.penAngle,
        drawingSettings.handType
      );
    }
  }

  ctx.restore();
}
