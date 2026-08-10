/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Render Engine
 */

import { AnimationFrameState } from './animationEngine';
import { BackgroundSettings, DrawingSettings, DrawingStyleMode, Stroke, ViewSettings } from './types';

const realHandPhotoUrl = new URL('../assets/images/real_hand_marker_1786268856778.jpg', import.meta.url).href;

let cachedHandPhotoCanvas: HTMLCanvasElement | null = null;
let rawHandImage: HTMLImageElement | null = null;
let isHandPhotoLoading = false;

// Offscreen Completed Strokes Cache for 60 FPS smooth rendering
let offscreenCacheCanvas: HTMLCanvasElement | null = null;
let offscreenCacheCtx: CanvasRenderingContext2D | null = null;
let lastCachedStrokeCount = 0;
let lastCacheConfigKey = '';

function getProcessedRealHandCanvas(): HTMLCanvasElement | HTMLImageElement | null {
  if (cachedHandPhotoCanvas) return cachedHandPhotoCanvas;

  if (!isHandPhotoLoading) {
    isHandPhotoLoading = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      rawHandImage = img;
      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const data = imgData.data;

      // Chroma-key white/light background to make it transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > 210 && g > 210 && b > 210) {
          const minC = Math.min(r, g, b);
          const alpha = Math.max(0, 255 - (minC - 195) * 12);
          data[i + 3] = Math.min(data[i + 3], Math.round(alpha));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      cachedHandPhotoCanvas = cvs;
    };
    img.src = realHandPhotoUrl;
  }

  return rawHandImage;
}

/**
 * Draws a realistic photo hand holding a marker at (x, y)
 */
export function drawHandCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  _handType: DrawingSettings['handType'] = 'pen'
) {
  const handElement = getProcessedRealHandCanvas();
  if (!handElement) return;

  ctx.save();
  ctx.translate(x, y);

  const angleRad = (angle * Math.PI) / 180;
  const normAngle = Math.atan2(Math.sin(angleRad), Math.cos(angleRad)) * (180 / Math.PI);
  const wristOscillation = Math.max(-4, Math.min(4, normAngle * 0.03));
  
  ctx.rotate((wristOscillation * Math.PI) / 180);

  const drawW = 340;
  const drawH = 340;
  const tipX = drawW * 0.13;
  const tipY = drawH * 0.12;

  ctx.drawImage(handElement, -tipX, -tipY, drawW, drawH);

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
  originalImage?: HTMLImageElement | HTMLCanvasElement,
  projectDimensions?: { width: number; height: number }
) {
  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw Canvas Background
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
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (backgroundSettings.type === 'custom') {
    ctx.fillStyle = backgroundSettings.customColor || '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Calculate Fit-Screen Scaling and Centering Matrix
  const projW = projectDimensions?.width || 1280;
  const projH = projectDimensions?.height || 720;

  const scaleX = canvasWidth / projW;
  const scaleY = canvasHeight / projH;
  const fitScale = Math.min(scaleX, scaleY);

  const offsetX = (canvasWidth - projW * fitScale) / 2;
  const offsetY = (canvasHeight - projH * fitScale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(fitScale, fitScale);

  // 2. Draw Original Reference Image / Full Color Fills
  const isOriginalBg = backgroundSettings.type === 'original';

  if (originalImage) {
    let alpha = 0;
    if (viewSettings.showOriginal) {
      alpha = 1.0;
    } else if (isOriginalBg) {
      alpha = backgroundSettings.originalOpacity ?? 1.0;
    } else if ((backgroundSettings.originalOpacity ?? 0) > 0) {
      alpha = backgroundSettings.originalOpacity;
    } else {
      // Smoothly fade in original reference image only right at drawing completion (from drawingProgress 0.92 to 1.0)
      const prog = frameState.drawingProgress ?? frameState.overallProgress;
      if (prog > 0.92) {
        alpha = Math.min(1.0, (prog - 0.92) / 0.08);
      }
    }

    if (alpha > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.drawImage(originalImage, 0, 0, projW, projH);
      ctx.restore();
    }
  }

  // Helper to draw smooth quadratic curve path through points
  const drawSmoothPathPoints = (targetCtx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return;
    if (pts.length === 2) {
      targetCtx.moveTo(pts[0].x, pts[0].y);
      targetCtx.lineTo(pts[1].x, pts[1].y);
      return;
    }

    targetCtx.moveTo(pts[0].x, pts[0].y);
    let i = 1;
    for (; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2;
      const midY = (pts[i].y + pts[i + 1].y) / 2;
      targetCtx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    targetCtx.lineTo(pts[i].x, pts[i].y);
  };

  // 3. Helper to draw a single stroke given style settings
  const drawStrokeSegment = (
    targetCtx: CanvasRenderingContext2D,
    stroke: Stroke,
    points: { x: number; y: number; pressure?: number }[]
  ) => {
    if (points.length < 2) return;

    targetCtx.save();
    const baseColor = stroke.color || '#1e293b';
    const widthScale = drawingSettings.strokeWidth / 3;
    const rawWidth = stroke.width || drawingSettings.strokeWidth;
    const baseWidth = stroke.layer === 'fill' 
      ? Math.max(2, Math.min(rawWidth, rawWidth * widthScale))
      : rawWidth * widthScale;

    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';

    if (styleMode === 'PENCIL_SKETCH') {
      targetCtx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      targetCtx.lineWidth = Math.max(1, baseWidth * 0.8);

      targetCtx.beginPath();
      drawSmoothPathPoints(targetCtx, points);
      targetCtx.stroke();

      targetCtx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      targetCtx.lineWidth = Math.max(0.8, baseWidth * 0.5);
      targetCtx.beginPath();
      const offsetPts = points.map(p => ({ x: p.x + 0.8, y: p.y - 0.5 }));
      drawSmoothPathPoints(targetCtx, offsetPts);
      targetCtx.stroke();
    } else if (styleMode === 'MARKER') {
      targetCtx.globalAlpha = 0.85;
      targetCtx.strokeStyle = baseColor;
      targetCtx.lineWidth = baseWidth * 1.8;
      targetCtx.beginPath();
      drawSmoothPathPoints(targetCtx, points);
      targetCtx.stroke();
    } else if (styleMode === 'CLEAN_WHITEBOARD') {
      targetCtx.globalAlpha = 0.95;
      targetCtx.strokeStyle = baseColor === '#ffffff' ? '#2563eb' : baseColor;
      targetCtx.lineWidth = baseWidth * 1.4;
      targetCtx.beginPath();
      drawSmoothPathPoints(targetCtx, points);
      targetCtx.stroke();
    } else if (styleMode === 'INK' || styleMode === 'REALISTIC_HAND' || styleMode === 'AUTO') {
      targetCtx.globalAlpha = stroke.opacity * drawingSettings.strokeOpacity;
      targetCtx.strokeStyle = baseColor;

      if (!drawingSettings.pressureVariation || drawingSettings.pressureVariation < 0.1) {
        targetCtx.lineWidth = baseWidth;
        targetCtx.beginPath();
        drawSmoothPathPoints(targetCtx, points);
        targetCtx.stroke();
      } else {
        let currentWidth = Math.max(1, baseWidth * ((points[0].pressure || 1) * (drawingSettings.pressureVariation * 0.5 + 0.75)));
        targetCtx.lineWidth = currentWidth;
        targetCtx.beginPath();
        targetCtx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          const pressure = (points[i].pressure || 1) * (drawingSettings.pressureVariation * 0.5 + 0.75);
          const w = Math.max(1, baseWidth * pressure);

          if (Math.abs(w - currentWidth) > 0.5) {
            targetCtx.lineTo(points[i].x, points[i].y);
            targetCtx.stroke();
            targetCtx.beginPath();
            targetCtx.moveTo(points[i].x, points[i].y);
            targetCtx.lineWidth = w;
            currentWidth = w;
          } else {
            targetCtx.lineTo(points[i].x, points[i].y);
          }
        }
        targetCtx.stroke();
      }
    } else {
      // VECTOR_PRECISE
      targetCtx.globalAlpha = stroke.opacity * drawingSettings.strokeOpacity;
      targetCtx.strokeStyle = baseColor;
      targetCtx.lineWidth = baseWidth;
      targetCtx.beginPath();
      drawSmoothPathPoints(targetCtx, points);
      targetCtx.stroke();
    }

    targetCtx.restore();
  };

  // 4. Render Completed Strokes using Offscreen Canvas Cache for 60 FPS smooth animation
  const currentConfigKey = `${projW}x${projH}_${styleMode}_${drawingSettings.strokeWidth}_${drawingSettings.strokeOpacity}_${drawingSettings.pressureVariation}`;

  if (
    !offscreenCacheCanvas ||
    offscreenCacheCanvas.width !== projW ||
    offscreenCacheCanvas.height !== projH ||
    lastCacheConfigKey !== currentConfigKey
  ) {
    offscreenCacheCanvas = document.createElement('canvas');
    offscreenCacheCanvas.width = projW;
    offscreenCacheCanvas.height = projH;
    offscreenCacheCtx = offscreenCacheCanvas.getContext('2d');
    lastCachedStrokeCount = 0;
    lastCacheConfigKey = currentConfigKey;
  }

  // If completed strokes reset or rewound, clear offscreen cache
  if (frameState.completedStrokes.length < lastCachedStrokeCount) {
    offscreenCacheCtx?.clearRect(0, 0, projW, projH);
    lastCachedStrokeCount = 0;
  }

  // Bake newly completed strokes onto offscreen canvas incrementally
  if (offscreenCacheCtx && frameState.completedStrokes.length > lastCachedStrokeCount) {
    for (let i = lastCachedStrokeCount; i < frameState.completedStrokes.length; i++) {
      const stroke = frameState.completedStrokes[i];
      drawStrokeSegment(offscreenCacheCtx, stroke, stroke.points);
    }
    lastCachedStrokeCount = frameState.completedStrokes.length;
  }

  // Draw cached completed strokes onto main canvas in 1 ultra-fast drawImage call
  if (offscreenCacheCanvas && lastCachedStrokeCount > 0) {
    ctx.drawImage(offscreenCacheCanvas, 0, 0);
  }

  // 5. Render Active Strokes on top
  for (const activeState of frameState.activeStrokes) {
    drawStrokeSegment(ctx, activeState.stroke, activeState.visiblePoints);
  }

  // 6. Render Drawing Path Debug Overlay if enabled
  if (viewSettings.showDrawingPath) {
    ctx.save();
    const colorList = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const allStrokes = [...frameState.completedStrokes, ...frameState.activeStrokes.map((a) => a.stroke)];

    allStrokes.forEach((stroke, idx) => {
      const isSelected = viewSettings.selectedStrokeId === stroke.id;
      const pathColor = isSelected ? '#eab308' : colorList[idx % colorList.length];

      ctx.strokeStyle = pathColor;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.setLineDash(isSelected ? [] : [4, 4]);

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let p = 1; p < stroke.points.length; p++) {
        ctx.lineTo(stroke.points[p].x, stroke.points[p].y);
      }
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(stroke.startPoint.x, stroke.startPoint.y, isSelected ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(stroke.endPoint.x - (isSelected ? 5 : 3), stroke.endPoint.y - (isSelected ? 5 : 3), isSelected ? 10 : 6, isSelected ? 10 : 6);

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
  ctx.restore();
}
