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
  Hash
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
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  project,
  frameState,
  viewSettings,
  onUpdateViewSettings,
  onSelectStroke,
  edgeImageData,
  skeletonImageData,
  isAnalyzing
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
        originalImgEl || undefined
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
      {/* Top View Mode Tabs */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl">
        <button
          onClick={() => setActiveTab('animation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'animation'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Animation Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'analysis'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
          <span>Edge / Skeleton</span>
        </button>

        <button
          onClick={() => setActiveTab('original')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'original'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Original</span>
        </button>
      </div>

      {/* Floating View Toggles Toolbar (Right side) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
        {/* Toggle Show Original Overlay */}
        <button
          onClick={() => onUpdateViewSettings({ showOriginal: !viewSettings.showOriginal })}
          className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
            viewSettings.showOriginal
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle Show Original Reference Image"
        >
          {viewSettings.showOriginal ? <Eye className="w-4 h-4 text-indigo-400" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Toggle Show Drawing Vector Paths */}
        <button
          onClick={() => onUpdateViewSettings({ showDrawingPath: !viewSettings.showDrawingPath })}
          className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
            viewSettings.showDrawingPath
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle Show Drawing Vector Paths (Debug Lines & Nodes)"
        >
          <GitCommit className="w-4 h-4" />
        </button>

        {/* Toggle Show Stroke Index Numbers */}
        {viewSettings.showDrawingPath && (
          <button
            onClick={() => onUpdateViewSettings({ showStrokeNumbers: !viewSettings.showStrokeNumbers })}
            className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
              viewSettings.showStrokeNumbers
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Show Stroke Index Numbers (#1, #2...)"
          >
            <Hash className="w-4 h-4" />
          </button>
        )}

        {/* Toggle Show Skeleton in Analysis Tab */}
        {activeTab === 'analysis' && (
          <button
            onClick={() => onUpdateViewSettings({ showSkeleton: !viewSettings.showSkeleton })}
            className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
              viewSettings.showSkeleton
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Zhang-Suen Thinning Skeleton Lines"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}

        <div className="h-px bg-slate-800 my-0.5" />

        {/* Zoom Controls */}
        <button
          onClick={() => setScale((s) => Math.min(5, s * 1.25))}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.2, s * 0.8))}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetPanZoom}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
          title="Reset Zoom & Pan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Viewport with Pan & Zoom */}
      <div
        className="flex-1 flex items-center justify-center p-8 cursor-grab active:cursor-grabbing overflow-hidden"
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
            transition: isPanning ? 'none' : 'transform 0.08s ease-out'
          }}
          className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-800/80 bg-white dark:bg-slate-900"
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="block max-w-full max-h-[72vh] object-contain"
          />

          {/* Analyzing Progress Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center">
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

      {/* Bottom Status & Info Bar */}
      <div className="bg-slate-900/80 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(scale * 100)}%</span>
          {viewSettings.selectedStrokeId && (
            <span className="text-amber-400 flex items-center gap-1 font-sans font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Selected: {viewSettings.selectedStrokeId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{project.styleMode.replace('_', ' ')}</span>
          <span>•</span>
          <span>{frameState.currentTime.toFixed(1)}s / {frameState.totalDuration.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
