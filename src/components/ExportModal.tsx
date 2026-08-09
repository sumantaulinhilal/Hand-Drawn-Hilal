/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Export Modal Component
 */

import React, { useState } from 'react';
import { Download, Film, FileCode, FileImage, Archive, Check, Loader2, X } from 'lucide-react';
import {
  exportHighResPng,
  exportWebmVideo,
  exportZipFrames,
  generateAnimatedSvg
} from '../engine/exportEngine';
import { AnimationProject, ExportOptions } from '../engine/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: AnimationProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [format, setFormat] = useState<ExportOptions['format']>('webm');
  const [quality, setQuality] = useState<ExportOptions['quality']>('1080p');
  const [includeHand, setIncludeHand] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setIsDone(false);

    try {
      if (format === 'animated-svg' || format === 'svg') {
        const svgString = generateAnimatedSvg(project);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        downloadBlob(blob, `hand_draw_animation_${project.id}.svg`);
      } else if (format === 'png') {
        const blob = await exportHighResPng(project, quality);
        downloadBlob(blob, `hand_draw_frame_${project.id}.png`);
      } else if (format === 'webm') {
        const blob = await exportWebmVideo(
          project,
          { format, quality, fps: 30, transparentBackground: false, includeHandCursor: includeHand },
          (p) => setProgress(p)
        );
        downloadBlob(blob, `hand_draw_animation_${project.id}.webm`);
      } else if (format === 'zip-frames') {
        const blob = await exportZipFrames(
          project,
          { format, quality, fps: 24, transparentBackground: false, includeHandCursor: includeHand },
          (p) => setProgress(p)
        );
        downloadBlob(blob, `hand_draw_frames_${project.id}.zip`);
      }

      setIsDone(true);
    } catch {
      // Handle error
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Export Hand Draw Animation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export to WebM video, Animated SVG, PNG snapshot, or Frame sequence ZIP.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('webm')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                format === 'webm'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Film className="w-5 h-5 text-indigo-500" />
              <div>
                <h4 className="font-bold text-xs">WebM Video</h4>
                <p className="text-[10px] text-slate-500">Recorded Canvas Animation</p>
              </div>
            </button>

            <button
              onClick={() => setFormat('animated-svg')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                format === 'animated-svg'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileCode className="w-5 h-5 text-emerald-500" />
              <div>
                <h4 className="font-bold text-xs">Animated SVG</h4>
                <p className="text-[10px] text-slate-500">CSS keyframes vector file</p>
              </div>
            </button>

            <button
              onClick={() => setFormat('png')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                format === 'png'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileImage className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-bold text-xs">High-Res PNG</h4>
                <p className="text-[10px] text-slate-500">Static line drawing snapshot</p>
              </div>
            </button>

            <button
              onClick={() => setFormat('zip-frames')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                format === 'zip-frames'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Archive className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="font-bold text-xs">Frames ZIP</h4>
                <p className="text-[10px] text-slate-500">PNG image sequence archive</p>
              </div>
            </button>
          </div>
        </div>

        {/* Export Quality Selector */}
        {(format === 'webm' || format === 'png') && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Resolution Quality</label>
            <div className="grid grid-cols-3 gap-2">
              {(['720p', '1080p', '4k'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    quality === q
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Include Animated Pen / Hand Cursor Toggle */}
        {format === 'webm' && (
          <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 pt-1">
            <span>Include Animated Pen / Hand Cursor</span>
            <input
              type="checkbox"
              checked={includeHand}
              onChange={(e) => setIncludeHand(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        )}

        {/* Progress Bar during Export */}
        {isExporting && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" /> Rendering Frames...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-150"
              />
            </div>
          </div>
        )}

        {/* Start Export Button */}
        <button
          onClick={handleStartExport}
          disabled={isExporting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing Export...
            </>
          ) : isDone ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" /> Export Complete! Download Again
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download Export File
            </>
          )}
        </button>
      </div>
    </div>
  );
};
