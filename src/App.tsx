/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Main Application
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { CanvasPreview } from './components/CanvasPreview';
import { Timeline } from './components/Timeline';
import { ControlPanel } from './components/ControlPanel';
import { StrokeInspector } from './components/StrokeInspector';
import { PresetSelectorModal } from './components/PresetSelectorModal';
import { UploadModal } from './components/UploadModal';
import { ExportModal } from './components/ExportModal';
import { DebugPanel } from './components/DebugPanel';
import { ApkExportGuideModal } from './components/ApkExportGuideModal';

import { parseSvgToStrokes, preprocessRasterImage } from './engine/imageAnalyzer';
import { organizeStrokes } from './engine/strokeOrganizer';
import { optimizeStroke } from './engine/strokeOptimizer';
import { PRESET_DRAWINGS, PresetItem } from './presets/presetData';
import {
  AnalysisSettings,
  AnimationProject,
  AnimationSettings,
  BackgroundSettings,
  DeveloperDebugInfo,
  DrawingSettings,
  DrawingStyleMode,
  Stroke,
  ViewSettings
} from './engine/types';
import { useAnimationLoop } from './hooks/useAnimationLoop';

const DEFAULT_ANALYSIS_SETTINGS: AnalysisSettings = {
  grayscale: false,
  contrast: 25,
  brightness: 0,
  threshold: 120,
  edgeSensitivity: 7,
  detailSensitivity: 6,
  noiseReduction: 2,
  skeletonization: true,
  strokeSimplification: 2.0,
  minStrokeLength: 16,
  strokeDensity: 6,
  fillDensity: 7,
  invert: false,
  autoTraceSvg: true
};

const DEFAULT_DRAWING_SETTINGS: DrawingSettings = {
  strokeWidth: 3.5,
  strokeOpacity: 0.95,
  drawingSpeed: 1.0,
  pressureVariation: 0.3,
  smoothness: 3,
  handJitter: 0,
  naturalVariation: 1,
  strokeOrderPriority: 'left-to-right',
  showHandCursor: true,
  handType: 'pen',
  concurrentStrokes: 1
};

const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  duration: 5.0,
  startDelay: 0.2,
  endDelay: 4.0,
  easing: 'natural-hand',
  loop: true,
  reverse: false
};

const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  type: 'white',
  customColor: '#ffffff',
  originalOpacity: 0.0
};

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);

  // Status & Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState('READY');
  const [edgeImageData, setEdgeImageData] = useState<ImageData | null>(null);
  const [skeletonImageData, setSkeletonImageData] = useState<ImageData | null>(null);

  // Debug Panel State
  const [debugInfo, setDebugInfo] = useState<DeveloperDebugInfo>({
    enabled: false,
    fps: 60,
    processingTimeMs: 0,
    detectedEdgesCount: 0,
    skeletonPixelCount: 0,
    extractedStrokeCount: 0,
    totalPathLengthPx: 0,
    workerActive: false
  });

  // View Settings State
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    showOriginal: false,
    showDrawingPath: false,
    showSkeleton: false,
    showEdges: false,
    showNodes: false,
    showStrokeNumbers: true,
    selectedStrokeId: null,
    activeTab: 'drawing'
  });

  // Control Panel Active Tab
  const [activeControlTab, setActiveControlTab] = useState<'image' | 'analysis' | 'drawing' | 'style' | 'animation' | 'background'>('style');

  // Main Animation Project State
  const [project, setProject] = useState<AnimationProject>(() => {
    const initialPreset = PRESET_DRAWINGS[0];
    const initialStrokes = parseSvgToStrokes(initialPreset.svgData, 1280, 720);
    const organizedStrokes = organizeStrokes(initialStrokes, DEFAULT_DRAWING_SETTINGS, 1280, 720);

    return {
      id: initialPreset.id,
      name: initialPreset.name,
      sourceType: 'svg',
      sourceUrl: initialPreset.svgData,
      originalWidth: 1280,
      originalHeight: 720,
      aspectRatio: 16 / 9,
      aspectRatioPreset: '16:9',
      strokes: organizedStrokes,
      analysisSettings: DEFAULT_ANALYSIS_SETTINGS,
      drawingSettings: DEFAULT_DRAWING_SETTINGS,
      animationSettings: DEFAULT_ANIMATION_SETTINGS,
      backgroundSettings: DEFAULT_BACKGROUND_SETTINGS,
      styleMode: 'REALISTIC_HAND'
    };
  });

  // Animation Loop Hook
  const {
    isPlaying,
    currentTime,
    computedTotalDuration,
    currentFrameState,
    fps,
    play,
    pause,
    togglePlay,
    seek,
    restart
  } = useAnimationLoop(project);

  // Sync FPS to debug info
  useEffect(() => {
    setDebugInfo((prev) => ({ ...prev, fps }));
  }, [fps]);

  // Worker Ref for Web Worker processing
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL('./workers/analysisWorker.ts', import.meta.url), {
        type: 'module'
      });

      workerRef.current.onmessage = (e) => {
        const { type, status, message, strokes, detectedEdgesCount, skeletonPixelCount, edgeImageData, skeletonImageData } = e.data;

        if (type === 'PROGRESS') {
          setStatusText(message.toUpperCase());
        } else if (type === 'COMPLETE') {
          setIsAnalyzing(false);
          setStatusText('READY.');
          setEdgeImageData(edgeImageData);
          setSkeletonImageData(skeletonImageData);

          setProject((prev) => ({
            ...prev,
            strokes
          }));

          const totalLen = strokes.reduce((acc: number, s: Stroke) => acc + s.length, 0);

          setDebugInfo((prev) => ({
            ...prev,
            detectedEdgesCount,
            skeletonPixelCount,
            extractedStrokeCount: strokes.length,
            totalPathLengthPx: totalLen,
            workerActive: false
          }));
        } else if (type === 'ERROR') {
          setIsAnalyzing(false);
          setStatusText('ANALYSIS ERROR');
        }
      };
    } catch {
      // Fallback if browser blocks inline workers
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Process & Re-Analyze Raster Image
  const analyzeRasterImage = useCallback(
    (imageSource: string | HTMLImageElement) => {
      setIsAnalyzing(true);
      setStatusText('ANALYZING IMAGE...');

      const startTime = performance.now();

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let targetWidth = 1280;
        let targetHeight = 720;

        const preset = project.aspectRatioPreset || '16:9';
        if (preset === 'auto') {
          targetWidth = 1280;
          targetHeight = Math.max(360, Math.min(2160, Math.round(1280 / imgAspect)));
        } else if (preset === '4:3') {
          targetWidth = 1024;
          targetHeight = 768;
        } else if (preset === '1:1') {
          targetWidth = 800;
          targetHeight = 800;
        } else if (preset === '9:16') {
          targetWidth = 720;
          targetHeight = 1280;
        } else {
          // '16:9'
          targetWidth = 1280;
          targetHeight = 720;
        }

        setProject((prev) => ({
          ...prev,
          originalWidth: targetWidth,
          originalHeight: targetHeight,
          aspectRatio: targetWidth / targetHeight
        }));

        const { imageData } = preprocessRasterImage(
          img,
          project.analysisSettings,
          targetWidth,
          targetHeight
        );

        if (workerRef.current) {
          setDebugInfo((prev) => ({ ...prev, workerActive: true }));
          workerRef.current.postMessage({
            type: 'ANALYZE_RASTER',
            imageData,
            analysisSettings: project.analysisSettings,
            drawingSettings: project.drawingSettings,
            canvasWidth: targetWidth,
            canvasHeight: targetHeight
          });
        }
        setDebugInfo((prev) => ({ ...prev, processingTimeMs: Math.round(performance.now() - startTime) }));
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        img.src = imageSource.src;
      }
    },
    [project.analysisSettings, project.drawingSettings, project.aspectRatioPreset]
  );

  // Handle Loading Image / Preset
  const handleLoadImage = (sourceUrl: string, sourceType: 'raster' | 'svg') => {
    let targetWidth = project.originalWidth || 1280;
    let targetHeight = project.originalHeight || 720;

    const preset = project.aspectRatioPreset || '16:9';
    if (preset === '16:9') {
      targetWidth = 1280;
      targetHeight = 720;
    } else if (preset === '4:3') {
      targetWidth = 1024;
      targetHeight = 768;
    } else if (preset === '1:1') {
      targetWidth = 800;
      targetHeight = 800;
    } else if (preset === '9:16') {
      targetWidth = 720;
      targetHeight = 1280;
    }

    if (sourceType === 'svg') {
      const extractedStrokes = parseSvgToStrokes(sourceUrl, targetWidth, targetHeight);
      const optimized = extractedStrokes.map((s) => optimizeStroke(s, project.drawingSettings));
      const organized = organizeStrokes(optimized, project.drawingSettings, targetWidth, targetHeight);

      setProject((prev) => ({
        ...prev,
        originalWidth: targetWidth,
        originalHeight: targetHeight,
        aspectRatio: targetWidth / targetHeight,
        sourceType: 'svg',
        sourceUrl,
        strokes: organized
      }));
      setStatusText('READY.');
    } else {
      setProject((prev) => ({
        ...prev,
        originalWidth: targetWidth,
        originalHeight: targetHeight,
        aspectRatio: targetWidth / targetHeight,
        sourceType: 'raster',
        sourceUrl,
        backgroundSettings: {
          ...prev.backgroundSettings,
          type: 'white'
        }
      }));
      analyzeRasterImage(sourceUrl);
    }
  };

  // Handle Preset Load
  const handleSelectPreset = (preset: PresetItem) => {
    handleLoadImage(preset.svgData, 'svg');
  };

  // Stroke Editing Handlers
  const handleSelectStroke = (strokeId: string | null) => {
    setViewSettings((prev) => ({ ...prev, selectedStrokeId: strokeId }));
  };

  const handleReverseStroke = (id: string) => {
    setProject((prev) => ({
      ...prev,
      strokes: prev.strokes.map((s) => {
        if (s.id !== id) return s;
        const revPoints = [...s.points].reverse();
        return {
          ...s,
          points: revPoints,
          startPoint: revPoints[0],
          endPoint: revPoints[revPoints.length - 1],
          direction: (s.direction + 180) % 360
        };
      })
    }));
  };

  const handleDeleteStroke = (id: string) => {
    setProject((prev) => ({
      ...prev,
      strokes: prev.strokes.filter((s) => s.id !== id)
    }));
    setViewSettings((prev) => ({ ...prev, selectedStrokeId: null }));
  };

  const handleDuplicateStroke = (id: string) => {
    const target = project.strokes.find((s) => s.id === id);
    if (!target) return;

    const dupPoints = target.points.map((p) => ({ x: p.x + 10, y: p.y + 10, pressure: p.pressure }));
    const newStroke: Stroke = {
      ...target,
      id: `${target.id}-copy-${Date.now()}`,
      points: dupPoints,
      startPoint: dupPoints[0],
      endPoint: dupPoints[dupPoints.length - 1],
      order: project.strokes.length + 1
    };

    setProject((prev) => ({
      ...prev,
      strokes: [...prev.strokes, newStroke]
    }));
  };

  const handleMoveOrder = (id: string, delta: number) => {
    const idx = project.strokes.findIndex((s) => s.id === id);
    if (idx === -1) return;

    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= project.strokes.length) return;

    const updated = [...project.strokes];
    const [moved] = updated.splice(idx, 1);
    updated.splice(newIdx, 0, moved);

    setProject((prev) => ({
      ...prev,
      strokes: updated.map((s, orderIdx) => ({ ...s, order: orderIdx + 1 }))
    }));
  };

  const handleAutoOrganize = () => {
    const reOrganized = organizeStrokes(project.strokes, project.drawingSettings, 800, 800);
    setProject((prev) => ({
      ...prev,
      strokes: reOrganized
    }));
    setStatusText('STROKES AUTO-ORGANIZED.');
  };

  // Selected stroke reference for inspector
  const selectedStroke = project.strokes.find((s) => s.id === viewSettings.selectedStrokeId) || null;

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header Bar */}
      <Header
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenApkGuide={() => setIsApkGuideOpen(true)}
        onToggleDebug={() => setDebugInfo((prev) => ({ ...prev, enabled: !prev.enabled }))}
        isDebugEnabled={debugInfo.enabled}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        strokeCount={project.strokes.length}
        statusText={statusText}
      />

      {/* Main Content Area (Canvas + Controls Sidebar) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Canvas Preview Area */}
        <CanvasPreview
          project={project}
          frameState={currentFrameState}
          viewSettings={viewSettings}
          onUpdateViewSettings={(updated) => setViewSettings((prev) => ({ ...prev, ...updated }))}
          onSelectStroke={handleSelectStroke}
          edgeImageData={edgeImageData}
          skeletonImageData={skeletonImageData}
          isAnalyzing={isAnalyzing}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onRestart={restart}
        />

        {/* Floating Stroke Inspector Modal (Over Canvas) */}
        {viewSettings.selectedStrokeId && (
          <div className="absolute top-16 left-4 z-30">
            <StrokeInspector
              stroke={selectedStroke}
              onClose={() => handleSelectStroke(null)}
              onReverseStroke={handleReverseStroke}
              onDeleteStroke={handleDeleteStroke}
              onDuplicateStroke={handleDuplicateStroke}
              onMoveOrder={handleMoveOrder}
              onAutoOrganize={handleAutoOrganize}
            />
          </div>
        )}

        {/* Controls Sidebar */}
        <ControlPanel
          project={project}
          onUpdateAnalysis={(updated) => {
            setProject((prev) => ({
              ...prev,
              analysisSettings: { ...prev.analysisSettings, ...updated }
            }));
            if (project.sourceType === 'raster' && project.sourceUrl) {
              analyzeRasterImage(project.sourceUrl);
            }
          }}
          onUpdateDrawing={(updated) =>
            setProject((prev) => {
              const newSettings = { ...prev.drawingSettings, ...updated };
              const reOrganized = organizeStrokes(
                prev.strokes,
                newSettings,
                prev.originalWidth,
                prev.originalHeight
              );
              return {
                ...prev,
                drawingSettings: newSettings,
                strokes: reOrganized
              };
            })
          }
          onUpdateAnimation={(updated) =>
            setProject((prev) => ({
              ...prev,
              animationSettings: { ...prev.animationSettings, ...updated }
            }))
          }
          onUpdateBackground={(updated) =>
            setProject((prev) => ({
              ...prev,
              backgroundSettings: { ...prev.backgroundSettings, ...updated }
            }))
          }
          onUpdateStyleMode={(styleMode) =>
            setProject((prev) => ({ ...prev, styleMode }))
          }
          onUpdateAspectRatioPreset={(preset) => {
            let w = 1280;
            let h = 720;
            if (preset === '4:3') { w = 1024; h = 768; }
            else if (preset === '1:1') { w = 800; h = 800; }
            else if (preset === '9:16') { w = 720; h = 1280; }

            setProject((prev) => ({
              ...prev,
              aspectRatioPreset: preset,
              originalWidth: w,
              originalHeight: h,
              aspectRatio: w / h
            }));

            if (project.sourceType === 'raster' && project.sourceUrl) {
              analyzeRasterImage(project.sourceUrl);
            } else if (project.sourceType === 'svg' && project.sourceUrl) {
              const extractedStrokes = parseSvgToStrokes(project.sourceUrl, w, h);
              const optimized = extractedStrokes.map((s) => optimizeStroke(s, project.drawingSettings));
              const organized = organizeStrokes(optimized, project.drawingSettings, w, h);
              setProject((prev) => ({ ...prev, strokes: organized }));
            }
          }}
          onOpenUpload={() => setIsUploadOpen(true)}
          activeTab={activeControlTab}
          onChangeTab={setActiveControlTab}
        />
      </div>

      {/* Timeline Editor Bar */}
      <Timeline
        project={project}
        frameState={currentFrameState}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onRestart={restart}
        onSeek={seek}
        onUpdateAnimationSettings={(updated) =>
          setProject((prev) => ({
            ...prev,
            animationSettings: { ...prev.animationSettings, ...updated }
          }))
        }
        onUpdateDrawingSettings={(updated) =>
          setProject((prev) => ({
            ...prev,
            drawingSettings: { ...prev.drawingSettings, ...updated }
          }))
        }
      />

      {/* Modals & Drawers */}
      <PresetSelectorModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
        currentPresetId={project.id}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onLoadImage={handleLoadImage}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />

      <ApkExportGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
      />

      <DebugPanel
        debugInfo={debugInfo}
        onClose={() => setDebugInfo((prev) => ({ ...prev, enabled: false }))}
        edgeImageData={edgeImageData}
        skeletonImageData={skeletonImageData}
      />
    </div>
  );
}
