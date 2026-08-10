/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Canvas Preview Component
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnimationFrameState } from '../engine/animationEngine';
import { renderCanvasFrame } from '../engine/renderEngine';
import { AnimationProject, ViewSettings } from '../engine/types';
import { useCanvasPanZoom } from '../hooks/useCanvasPanZoom';
import {
  Eye,
  EyeOff,
  GitCommit,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  PenTool,
  Hash,
  Play,
  Pause
} from 'lucide-react';

interface CanvasPreviewProps {
  project: AnimationProject;
  frameState: AnimationFrameState;
  viewSettings: ViewSettings;
  onUpdateViewSettings: (updated: Partial<ViewSettings>) => void;
  onSelectStroke: (strokeId: string | null) => void;
  edgeImageData?: ImageData | null;
  skeletonImageData?: ImageData | null;
  isAnalyzing: boolean;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onRestart?: () => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  project,
  frameState,
  viewSettings,
  onUpdateViewSettings,
  onSelectStroke,
  edgeImageData,
  skeletonImageData,
  isAnalyzing,
  isPlaying,
  onTogglePlay,
  onRestart
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<'animation' | 'original' | 'analysis' | 'final'>('animation');
  const [originalImgEl, setOriginalImgEl] = useState<HTMLImageElement | null>(null);

  const {
    scale,
    offset,
    isPanning,
    resetPanZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setScale
  } = useCanvasPanZoom();

  // Load original source image into element for overlay
  useEffect(() => {
    if (!project.sourceUrl) return;

    if (project.sourceType === 'svg') {
      const img = new Image();
      const svgBlob = new Blob([project.sourceUrl], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => setOriginalImgEl(img);
      img.src = url;
    } else {
      const img = new Image();
      img.onload = () => setOriginalImgEl(img);
      img.src = project.sourceUrl;
    }
  }, [project.sourceUrl, project.sourceType]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = project.originalWidth || 800;
    const height = project.originalHeight || 800;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    if (activeTab === 'analysis') {
      ctx.clearRect(0, 0, width, height);
      if (viewSettings.showSkeleton && skeletonImageData) {
        ctx.putImageData(skeletonImageData, 0, 0);
      } else if (edgeImageData) {
        ctx.putImageData(edgeImageData, 0, 0);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      }
    } else if (activeTab === 'original' && originalImgEl) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(originalImgEl, 0, 0, width, height);
    } else {
      // Main Animation or Final Render
      renderCanvasFrame(
        ctx,
        width,
        height,
        frameState,
        project.styleMode,
        project.drawingSettings,
        project.backgroundSettings,
        viewSettings,
        originalImgEl || undefined,
        { width, height }
      );
    }
  }, [
    project,
    frameState,
    viewSettings,
    activeTab,
    originalImgEl,
    edgeImageData,
    skeletonImageData
  ]);

  // Handle canvas click to select stroke nearest to click position
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / (rect.width / canvas.width);
    const clickY = (e.clientY - rect.top) / (rect.height / canvas.height);

    let nearestStrokeId: string | null = null;
    let minDistance = 20; // 20px threshold

    for (const stroke of project.strokes) {
      for (const pt of stroke.points) {
        const dist = Math.hypot(pt.x - clickX, pt.y - clickY);
        if (dist < minDistance) {
          minDistance = dist;
          nearestStrokeId = stroke.id;
        }
      }
    }

    onSelectStroke(nearestStrokeId);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-slate-950 flex flex-col overflow-hidden select-none"
    >
      {/* Main Canvas Viewport with Pan & Zoom */}
      <div
        className="flex-1 flex items-center justify-center p-4 sm:p-8 cursor-grab active:cursor-grabbing overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: isPanning ? 'none' : 'transform 0.08s ease-out',
            aspectRatio: `${project.originalWidth} / ${project.originalHeight}`
          }}
          className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-center max-w-full max-h-[78vh]"
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="block w-full h-full object-contain"
          />

          {/* Analyzing Progress Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center z-30">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 animate-spin">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                ANALYZING IMAGE & EXTRACTING STROKES...
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Running Sobel Edge Detection, Zhang-Suen Thinning & Path Optimization...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control & Status Bar (Clean & Outside Canvas) */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {/* Prominent Play / Pause Button directly under Canvas */}
          {onTogglePlay && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-md">
              <button
                onClick={onTogglePlay}
                className={`px-3.5 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
                title={isPlaying ? 'Pause Animation' : 'Play Animation'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              {onRestart && (
                <button
                  onClick={onRestart}
                  className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Replay from Beginning"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('animation')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'animation'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Animation</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
            <span>Skeleton</span>
          </button>

          <button
            onClick={() => setActiveTab('original')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'original'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Original</span>
          </button>
        </div>
        </div>

        {/* Zoom & View Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-slate-400">
            <button
              onClick={() => setScale((s) => Math.max(0.2, s * 0.8))}
              className="hover:text-white p-0.5"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(5, s * 1.25))}
              className="hover:text-white p-0.5"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetPanZoom}
              className="hover:text-white p-0.5 ml-1 border-l border-slate-800 pl-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onUpdateViewSettings({ showOriginal: !viewSettings.showOriginal })}
            className={`p-1.5 rounded-lg transition-colors border ${
              viewSettings.showOriginal
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Reference Image Overlay"
          >
            {viewSettings.showOriginal ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onUpdateViewSettings({ showDrawingPath: !viewSettings.showDrawingPath })}
            className={`p-1.5 rounded-lg transition-colors border ${
              viewSettings.showDrawingPath
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Drawing Vector Paths Debug Overlay"
          >
            <GitCommit className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status Info */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>{project.styleMode.replace('_', ' ')}</span>
          <span>•</span>
          <span>{frameState.currentTime.toFixed(1)}s / {frameState.totalDuration.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
