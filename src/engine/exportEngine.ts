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
 * Helper to load source image for rendering background/original image layer during export
 */
async function loadSourceImage(sourceUrl: string): Promise<HTMLImageElement | null> {
  if (!sourceUrl) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = sourceUrl;
  });
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

  const originalImg = await loadSourceImage(project.sourceUrl);

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

  const exportBackgroundSettings = {
    ...project.backgroundSettings,
    originalOpacity: project.backgroundSettings.type === 'original' ? project.backgroundSettings.originalOpacity : 0
  };

  renderCanvasFrame(
    ctx,
    targetWidth,
    targetHeight,
    frameState,
    project.styleMode,
    project.drawingSettings,
    exportBackgroundSettings,
    {
      showOriginal: false,
      showDrawingPath: false,
      showSkeleton: false,
      showEdges: false,
      showNodes: false,
      showStrokeNumbers: false,
      selectedStrokeId: null,
      activeTab: 'animation'
    },
    originalImg || undefined,
    { width: project.originalWidth || 1280, height: project.originalHeight || 720 }
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

  const originalImg = await loadSourceImage(project.sourceUrl);

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

  const fps = options.fps || 60;
  // Use manual frame rate capture stream (0 FPS) so every rendered frame is explicitly requested and encoded
  const stream = canvas.captureStream(0);
  const videoTrack = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 16_000_000 // 16 Mbps for crisp, ultra-smooth HD video
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const exportBackgroundSettings = {
    ...project.backgroundSettings,
    originalOpacity: project.backgroundSettings.type === 'original' ? project.backgroundSettings.originalOpacity : 0
  };

  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    mediaRecorder.start(100);

    const totalFrames = Math.max(1, Math.ceil(computedTotalDuration * fps));
    const frameDelayMs = Math.round(1000 / fps);

    const exportAsyncLoop = async () => {
      for (let currentFrame = 0; currentFrame <= totalFrames; currentFrame++) {
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
          exportBackgroundSettings,
          {
            showOriginal: false,
            showDrawingPath: false,
            showSkeleton: false,
            showEdges: false,
            showNodes: false,
            showStrokeNumbers: false,
            selectedStrokeId: null,
            activeTab: 'animation'
          },
          originalImg || undefined,
          { width: project.originalWidth || 1280, height: project.originalHeight || 720 }
        );

        if (videoTrack && typeof videoTrack.requestFrame === 'function') {
          videoTrack.requestFrame();
        }

        onProgress(Math.min(100, Math.round((currentFrame / totalFrames) * 100)));

        // Micro tick delay to yield main thread and guarantee MediaRecorder encodes frame cleanly
        await new Promise((r) => setTimeout(r, frameDelayMs));
      }

      // Add a clean hold frames at the end
      const holdFrames = Math.ceil(fps * (project.animationSettings.endDelay || 0.8));
      for (let h = 0; h < holdFrames; h++) {
        if (videoTrack && typeof videoTrack.requestFrame === 'function') {
          videoTrack.requestFrame();
        }
        await new Promise((r) => setTimeout(r, frameDelayMs));
      }

      setTimeout(() => {
        mediaRecorder.stop();
      }, 250);
    };

    exportAsyncLoop();
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

  const originalImg = await loadSourceImage(project.sourceUrl);

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

  const exportBackgroundSettings = {
    ...project.backgroundSettings,
    originalOpacity: project.backgroundSettings.type === 'original' ? project.backgroundSettings.originalOpacity : 0
  };

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
      exportBackgroundSettings,
      {
        showOriginal: false,
        showDrawingPath: false,
        showSkeleton: false,
        showEdges: false,
        showNodes: false,
        showStrokeNumbers: false,
        selectedStrokeId: null,
        activeTab: 'animation'
      },
      originalImg || undefined,
      { width: project.originalWidth || 1280, height: project.originalHeight || 720 }
    );

    const frameDataUrl = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    const frameName = `frame_${String(f).padStart(4, '0')}.png`;
    folder.file(frameName, frameDataUrl, { base64: true });

    onProgress(Math.round((f / totalFrames) * 100));
  }

  return await zip.generateAsync({ type: 'blob' });
}
