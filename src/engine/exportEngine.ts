/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Export Engine (SVG, PNG, WebM, ZIP)
 */

import JSZip from 'jszip';
import { calculateTimelineSchedule, evaluateAnimationFrame } from './animationEngine';
import { renderCanvasFrame } from './renderEngine';
import { AnimationProject, ExportOptions } from './types';

/**
 * Generates standalone Animated SVG XML with CSS @keyframes stroke-dashoffset animation
 */
export function generateAnimatedSvg(project: AnimationProject): string {
  const width = project.originalWidth || 800;
  const height = project.originalHeight || 800;

  const { scheduledStrokes, computedTotalDuration } = calculateTimelineSchedule(
    project.strokes,
    project.animationSettings,
    project.drawingSettings.drawingSpeed,
    project.drawingSettings.concurrentStrokes
  );

  let pathElements = '';
  let cssKeyframes = '';

  scheduledStrokes.forEach((stroke, idx) => {
    const totalLen = Math.max(1, stroke.length);
    const startPercent = Math.round((stroke.delay / (computedTotalDuration || 1)) * 100);
    const endPercent = Math.round(((stroke.delay + stroke.duration) / (computedTotalDuration || 1)) * 100);

    const animName = `draw_stroke_${idx + 1}`;

    cssKeyframes += `
    @keyframes ${animName} {
      0%, ${startPercent}% { stroke-dashoffset: ${totalLen}; }
      ${endPercent}%, 100% { stroke-dashoffset: 0; }
    }`;

    // Convert point array to d path attribute
    let d = stroke.pathData;
    if (!d || stroke.points.length > 0) {
      d = `M ${stroke.points[0].x} ${stroke.points[0].y}`;
      for (let i = 1; i < stroke.points.length; i++) {
        d += ` L ${stroke.points[i].x} ${stroke.points[i].y}`;
      }
    }

    pathElements += `
    <path
      d="${d}"
      stroke="${stroke.color || '#1e293b'}"
      stroke-width="${stroke.width || project.drawingSettings.strokeWidth}"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="stroke-dasharray: ${totalLen}; stroke-dashoffset: ${totalLen}; animation: ${animName} ${computedTotalDuration}s ease-in-out infinite;"
    />`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    ${cssKeyframes}
  </style>
  <rect width="${width}" height="${height}" fill="${project.backgroundSettings.type === 'black' ? '#0f172a' : '#ffffff'}" />
  ${pathElements}
</svg>`;
}

/**
 * Renders full project frame to PNG Blob at chosen resolution (720p, 1080p, 4K)
 */
export async function exportHighResPng(
  project: AnimationProject,
  quality: ExportOptions['quality'] = '1080p'
): Promise<Blob> {
  let targetWidth = 1920;
  let targetHeight = 1080;

  if (quality === '720p') {
    targetWidth = 1280;
    targetHeight = 720;
  } else if (quality === '4k') {
    targetWidth = 3840;
    targetHeight = 2160;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  const { scheduledStrokes, computedTotalDuration } = calculateTimelineSchedule(
    project.strokes,
    project.animationSettings,
    project.drawingSettings.drawingSpeed,
    project.drawingSettings.concurrentStrokes
  );

  const frameState = evaluateAnimationFrame(
    computedTotalDuration,
    scheduledStrokes,
    computedTotalDuration,
    project.animationSettings.easing
  );

  renderCanvasFrame(
    ctx,
    targetWidth,
    targetHeight,
    frameState,
    project.styleMode,
    project.drawingSettings,
    project.backgroundSettings,
    {
      showOriginal: false,
      showDrawingPath: false,
      showSkeleton: false,
      showEdges: false,
      showNodes: false,
      showStrokeNumbers: false,
      selectedStrokeId: null,
      activeTab: 'animation'
    }
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

/**
 * Records WebM Video from Canvas animation playback
 */
export async function exportWebmVideo(
  project: AnimationProject,
  options: ExportOptions,
  onProgress: (percent: number) => void
): Promise<Blob> {
  const targetWidth = options.quality === '4k' ? 3840 : options.quality === '720p' ? 1280 : 1920;
  const targetHeight = options.quality === '4k' ? 2160 : options.quality === '720p' ? 720 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  const { scheduledStrokes, computedTotalDuration } = calculateTimelineSchedule(
    project.strokes,
    project.animationSettings,
    project.drawingSettings.drawingSpeed,
    project.drawingSettings.concurrentStrokes
  );

  const stream = canvas.captureStream(options.fps || 30);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    mediaRecorder.start();

    const totalFrames = Math.ceil(computedTotalDuration * options.fps);
    let currentFrame = 0;

    const frameInterval = setInterval(() => {
      if (currentFrame > totalFrames) {
        clearInterval(frameInterval);
        mediaRecorder.stop();
        return;
      }

      const currentTime = (currentFrame / totalFrames) * computedTotalDuration;
      const frameState = evaluateAnimationFrame(
        currentTime,
        scheduledStrokes,
        computedTotalDuration,
        project.animationSettings.easing
      );

      renderCanvasFrame(
        ctx,
        targetWidth,
        targetHeight,
        frameState,
        project.styleMode,
        { ...project.drawingSettings, showHandCursor: options.includeHandCursor },
        project.backgroundSettings,
        {
          showOriginal: false,
          showDrawingPath: false,
          showSkeleton: false,
          showEdges: false,
          showNodes: false,
          showStrokeNumbers: false,
          selectedStrokeId: null,
          activeTab: 'animation'
        }
      );

      currentFrame++;
      onProgress(Math.round((currentFrame / totalFrames) * 100));
    }, 1000 / options.fps);
  });
}

/**
 * Exports frame sequence as ZIP file
 */
export async function exportZipFrames(
  project: AnimationProject,
  options: ExportOptions,
  onProgress: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('hand_draw_frames')!;

  const targetWidth = 1280;
  const targetHeight = 720;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  const { scheduledStrokes, computedTotalDuration } = calculateTimelineSchedule(
    project.strokes,
    project.animationSettings,
    project.drawingSettings.drawingSpeed,
    project.drawingSettings.concurrentStrokes
  );

  const fps = 24;
  const totalFrames = Math.ceil(computedTotalDuration * fps);

  for (let f = 0; f <= totalFrames; f++) {
    const t = (f / totalFrames) * computedTotalDuration;
    const frameState = evaluateAnimationFrame(t, scheduledStrokes, computedTotalDuration, project.animationSettings.easing);

    renderCanvasFrame(
      ctx,
      targetWidth,
      targetHeight,
      frameState,
      project.styleMode,
      project.drawingSettings,
      project.backgroundSettings,
      {
        showOriginal: false,
        showDrawingPath: false,
        showSkeleton: false,
        showEdges: false,
        showNodes: false,
        showStrokeNumbers: false,
        selectedStrokeId: null,
        activeTab: 'animation'
      }
    );

    const frameDataUrl = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    const frameName = `frame_${String(f).padStart(4, '0')}.png`;
    folder.file(frameName, frameDataUrl, { base64: true });

    onProgress(Math.round((f / totalFrames) * 100));
  }

  return await zip.generateAsync({ type: 'blob' });
}
