/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Control Panel Sidebar & Mobile Bottom Sheet
 */

import React from 'react';
import {
  Image as ImageIcon,
  Sliders,
  PenTool,
  Palette,
  Film,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { AnimationProject, DrawingStyleMode } from '../engine/types';

interface ControlPanelProps {
  project: AnimationProject;
  onUpdateAnalysis: (updated: Partial<AnimationProject['analysisSettings']>) => void;
  onUpdateDrawing: (updated: Partial<AnimationProject['drawingSettings']>) => void;
  onUpdateAnimation: (updated: Partial<AnimationProject['animationSettings']>) => void;
  onUpdateBackground: (updated: Partial<AnimationProject['backgroundSettings']>) => void;
  onUpdateStyleMode: (mode: DrawingStyleMode) => void;
  onUpdateAspectRatioPreset?: (preset: '16:9' | '4:3' | '1:1' | '9:16' | 'auto') => void;
  onOpenUpload: () => void;
  activeTab: 'image' | 'analysis' | 'drawing' | 'style' | 'animation' | 'background';
  onChangeTab: (tab: 'image' | 'analysis' | 'drawing' | 'style' | 'animation' | 'background') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  project,
  onUpdateAnalysis,
  onUpdateDrawing,
  onUpdateAnimation,
  onUpdateBackground,
  onUpdateStyleMode,
  onUpdateAspectRatioPreset,
  onOpenUpload,
  activeTab,
  onChangeTab
}) => {
  const [controlMode, setControlMode] = React.useState<'simple' | 'advanced'>('simple');

  const applyPreset = (preset: 'fast' | 'balanced' | 'hd') => {
    if (preset === 'fast') {
      onUpdateAnalysis({
        strokeDensity: 4,
        fillDensity: 4,
        edgeSensitivity: 5,
        strokeSimplification: 2.5,
        threshold: 110,
        noiseReduction: 3
      });
      onUpdateDrawing({
        strokeWidth: 3,
        pressureVariation: 0.15
      });
    } else if (preset === 'balanced') {
      onUpdateAnalysis({
        strokeDensity: 6,
        fillDensity: 7,
        edgeSensitivity: 7,
        strokeSimplification: 1.8,
        threshold: 80,
        noiseReduction: 2
      });
      onUpdateDrawing({
        strokeWidth: 3,
        pressureVariation: 0.25
      });
    } else if (preset === 'hd') {
      onUpdateAnalysis({
        strokeDensity: 9,
        fillDensity: 9,
        edgeSensitivity: 9,
        strokeSimplification: 1.0,
        threshold: 50,
        noiseReduction: 1
      });
      onUpdateDrawing({
        strokeWidth: 3,
        pressureVariation: 0.35
      });
    }
  };

  const styleModes: { mode: DrawingStyleMode; name: string; desc: string }[] = [
    { mode: 'REALISTIC_HAND', name: 'Realistic Hand Draw', desc: 'Natural pen & hand movement with ink dynamics' },
    { mode: 'CLEAN_WHITEBOARD', name: 'Clean Whiteboard', desc: 'Smooth glossy whiteboard marker lines' },
    { mode: 'PENCIL_SKETCH', name: 'Pencil Sketch', desc: 'Textured graphite pencil feel' },
    { mode: 'MARKER', name: 'Marker Pen', desc: 'Bold thick marker lines with wet overlap' },
    { mode: 'INK', name: 'Ink Fountain Pen', desc: 'Calligraphic pressure-sensitive ink' },
    { mode: 'VECTOR_PRECISE', name: 'Vector Precise', desc: 'Sharp vector stroke paths' },
    { mode: 'AUTO', name: 'Auto Engine', desc: 'Engine selects optimal style based on image' }
  ];

  return (
    <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden transition-colors">
      {/* Mode Selector Header (Simple vs Advanced) */}
      <div className="p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tampilan Kontrol:</span>
        <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-semibold">
          <button
            onClick={() => setControlMode('simple')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              controlMode === 'simple'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sederhana (Otomatis)
          </button>
          <button
            onClick={() => setControlMode('advanced')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              controlMode === 'advanced'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Lanjutan (Detail)
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center overflow-x-auto border-b border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-950 no-scrollbar">
        <button
          onClick={() => onChangeTab('image')}
          className={`flex-1 min-w-[65px] py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'image'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image</span>
        </button>

        <button
          onClick={() => onChangeTab('analysis')}
          className={`flex-1 min-w-[65px] py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'analysis'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Analysis</span>
        </button>

        <button
          onClick={() => onChangeTab('drawing')}
          className={`flex-1 min-w-[65px] py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'drawing'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Drawing</span>
        </button>

        <button
          onClick={() => onChangeTab('style')}
          className={`flex-1 min-w-[65px] py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'style'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Style</span>
        </button>

        <button
          onClick={() => onChangeTab('animation')}
          className={`flex-1 min-w-[65px] py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'animation'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Timing</span>
        </button>

        <button
          onClick={() => onChangeTab('background')}
          className={`flex-1 min-w-[65px] py-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'background'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Canvas</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-800 dark:text-slate-200 text-xs">
        {/* IMAGE TAB */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <button
              onClick={onOpenUpload}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <ImageIcon className="w-4 h-4" /> Replace / Upload Image
            </button>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between font-semibold">
                <span>Grayscale Mode</span>
                <input
                  type="checkbox"
                  checked={project.analysisSettings.grayscale}
                  onChange={(e) => onUpdateAnalysis({ grayscale: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between font-semibold">
                <span>Invert Image Colors</span>
                <input
                  type="checkbox"
                  checked={project.analysisSettings.invert}
                  onChange={(e) => onUpdateAnalysis({ invert: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span>Contrast</span>
                  <span>{project.analysisSettings.contrast}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={project.analysisSettings.contrast}
                  onChange={(e) => onUpdateAnalysis({ contrast: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span>Brightness</span>
                  <span>{project.analysisSettings.brightness}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={project.analysisSettings.brightness}
                  onChange={(e) => onUpdateAnalysis({ brightness: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {/* Quick Presets Section */}
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl space-y-2">
              <span className="font-bold text-[11px] text-indigo-900 dark:text-indigo-300 block">⚡ Preset Kualitas Otomatis</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('fast')}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-[10px] font-semibold flex flex-col items-center text-center transition-all shadow-xs"
                >
                  <span className="text-xs mb-0.5">🚀</span>
                  <span className="text-slate-800 dark:text-slate-200">Cepat</span>
                  <span className="text-[9px] text-slate-500 font-normal">Ringan (60 FPS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('balanced')}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-indigo-500 text-[10px] font-semibold flex flex-col items-center text-center transition-all shadow-xs"
                >
                  <span className="text-xs mb-0.5">🎯</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Ideal</span>
                  <span className="text-[9px] text-slate-500 font-normal">Sangat Mirip</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('hd')}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-[10px] font-semibold flex flex-col items-center text-center transition-all shadow-xs"
                >
                  <span className="text-xs mb-0.5">💎</span>
                  <span className="text-slate-800 dark:text-slate-200">HD Presisi</span>
                  <span className="text-[9px] text-slate-500 font-normal">Maksimal</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Stroke Density / Kerapatan Garis Sketsa</span>
                <span>{project.analysisSettings.strokeDensity ?? 6} / 10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={project.analysisSettings.strokeDensity ?? 6}
                onChange={(e) => onUpdateAnalysis({ strokeDensity: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Berapa banyak garis sketsa utama yang diekstrak dari gambar referensi</p>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>In-Paint Color Density / Kerapatan Warna Fill</span>
                <span>{project.analysisSettings.fillDensity ?? 7} / 10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={project.analysisSettings.fillDensity ?? 7}
                onChange={(e) => onUpdateAnalysis({ fillDensity: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Kerapatan warna isian (fill/paint) di dalam sketsa agar padat & rapat tanpa celah</p>
            </div>

            {controlMode === 'advanced' && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider block">Parametris Lanjutan</span>
                
                <label className="flex items-center justify-between font-semibold">
                  <span>Skeletonization (Zhang-Suen Thinning)</span>
                  <input
                    type="checkbox"
                    checked={project.analysisSettings.skeletonization}
                    onChange={(e) => onUpdateAnalysis({ skeletonization: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span>Sobel Threshold (Deteksi Tepi Gradient)</span>
                    <span>{project.analysisSettings.threshold}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={220}
                    value={project.analysisSettings.threshold}
                    onChange={(e) => onUpdateAnalysis({ threshold: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Ambang batas kecerahan untuk mengabaikan bayangan halus / noise latar</p>
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span>Line Sensitivity (Sensitivitas Garis Tipis)</span>
                    <span>{project.analysisSettings.edgeSensitivity}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={project.analysisSettings.edgeSensitivity}
                    onChange={(e) => onUpdateAnalysis({ edgeSensitivity: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span>Noise Reduction (Pembersih Bintik)</span>
                    <span>{project.analysisSettings.noiseReduction}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={project.analysisSettings.noiseReduction}
                    onChange={(e) => onUpdateAnalysis({ noiseReduction: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span>Path Simplification (RDP Tolerance)</span>
                    <span>{project.analysisSettings.strokeSimplification}</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={5.0}
                    step={0.1}
                    value={project.analysisSettings.strokeSimplification}
                    onChange={(e) => onUpdateAnalysis({ strokeSimplification: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* DRAWING TAB */}
        {activeTab === 'drawing' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Stroke Width</span>
                <span>{project.drawingSettings.strokeWidth}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={project.drawingSettings.strokeWidth}
                onChange={(e) => onUpdateDrawing({ strokeWidth: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Pressure Dynamics</span>
                <span>{Math.round(project.drawingSettings.pressureVariation * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={project.drawingSettings.pressureVariation}
                onChange={(e) => onUpdateDrawing({ pressureVariation: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Hand Jitter</span>
                <span>{project.drawingSettings.handJitter}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={project.drawingSettings.handJitter}
                onChange={(e) => onUpdateDrawing({ handJitter: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Path Smoothness</span>
                <span>{project.drawingSettings.smoothness}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                value={project.drawingSettings.smoothness}
                onChange={(e) => onUpdateDrawing({ smoothness: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block mb-2 font-semibold">Drawing Sequence Priority</label>
              <select
                value={project.drawingSettings.strokeOrderPriority}
                onChange={(e) => onUpdateDrawing({ strokeOrderPriority: e.target.value as any })}
                className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
              >
                <option value="left-to-right">Left to Right Sweep (Horizontal)</option>
                <option value="smart">Smart Natural Hand (Proximity TSP)</option>
                <option value="length">Main Outlines First (Length)</option>
                <option value="top-down">Top to Bottom</option>
                <option value="outside-in">Outside Inward</option>
              </select>
            </div>

            <label className="flex items-center justify-between font-semibold pt-2">
              <span>Show Animated Hand Cursor</span>
              <input
                type="checkbox"
                checked={project.drawingSettings.showHandCursor}
                onChange={(e) => onUpdateDrawing({ showHandCursor: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            {project.drawingSettings.showHandCursor && (
              <div>
                <label className="block mb-1.5 font-semibold">Hand Instrument Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['pen', 'pencil', 'marker', 'whiteboard-marker'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateDrawing({ handType: type })}
                      className={`p-2 rounded-lg capitalize text-xs font-semibold transition-all ${
                        project.drawingSettings.handType === type
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-3">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
              Select stroke rendering shader style:
            </p>
            {styleModes.map(({ mode, name, desc }) => (
              <button
                key={mode}
                onClick={() => onUpdateStyleMode(mode)}
                className={`w-full p-3 rounded-xl text-left border transition-all ${
                  project.styleMode === mode
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <h4 className="font-bold text-xs flex items-center justify-between">
                  <span>{name}</span>
                  {project.styleMode === mode && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* ANIMATION TAB */}
        {activeTab === 'animation' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Drawing Duration / Durasi Menggambar</span>
                <span>{project.animationSettings.duration}s</span>
              </div>
              <input
                type="range"
                min={3}
                max={60}
                value={project.animationSettings.duration}
                onChange={(e) => onUpdateAnimation({ duration: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Hold Delay at End / Durasi Jeda Selesai</span>
                <span>{project.animationSettings.endDelay ?? 4.0}s</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={10.0}
                step={0.5}
                value={project.animationSettings.endDelay ?? 4.0}
                onChange={(e) => onUpdateAnimation({ endDelay: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Waktu tahan/diam gambar lengkap setelah selesai digambar sebelum mengulang</p>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Hand Movement Easing Profile</label>
              <select
                value={project.animationSettings.easing}
                onChange={(e) => onUpdateAnimation({ easing: e.target.value as any })}
                className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
              >
                <option value="natural-hand">Natural Human Velocity (Accelerate / Decelerate)</option>
                <option value="cubic-bezier">Smooth Cubic Bezier</option>
                <option value="ease-in-out">Ease In Out</option>
                <option value="linear">Constant Linear</option>
              </select>
            </div>
          </div>
        )}

        {/* BACKGROUND TAB */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold">Aspect Ratio Canvas Format</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '16:9', label: '16:9 (1280x720)' },
                  { id: 'auto', label: 'Auto (Match Image)' },
                  { id: '4:3', label: '4:3 (1024x768)' },
                  { id: '1:1', label: '1:1 (Square)' },
                  { id: '9:16', label: '9:16 (720x1280)' }
                ].map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => onUpdateAspectRatioPreset && onUpdateAspectRatioPreset(ar.id as any)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                      (project.aspectRatioPreset || '16:9') === ar.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Canvas Background Style</label>
              <div className="grid grid-cols-2 gap-2">
                {(['white', 'original', 'paper', 'grid', 'black', 'transparent'] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => onUpdateBackground({ type: bg, originalOpacity: bg === 'original' ? 0.95 : project.backgroundSettings.originalOpacity })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      project.backgroundSettings.type === bg
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {bg === 'original' ? '🎨 Full Color Original' : bg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Original Image Opacity Overlay</span>
                <span>{Math.round(project.backgroundSettings.originalOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={project.backgroundSettings.originalOpacity}
                onChange={(e) => onUpdateBackground({ originalOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
