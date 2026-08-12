/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Export Modal Component
 */

import React, { useState } from 'react';
import { Download, Film, FileCode, FileImage, Archive, Check, Loader2, X, Smartphone, Share2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import {
  exportHighResPng,
  exportVideo,
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

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

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

  const downloadBlob = async (blob: Blob, filename: string) => {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      try {
        const base64Data = await blobToBase64(blob);
        let savedFileUri = '';

        // 1. Attempt writing directly to Documents / Downloads folder on Android device
        try {
          const writeRes = await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Documents,
            recursive: true
          });
          savedFileUri = writeRes.uri;
        } catch (errDoc) {
          console.warn('Could not write to Documents, falling back to Cache dir:', errDoc);
          const cacheRes = await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Cache,
            recursive: true
          });
          savedFileUri = cacheRes.uri;
        }

        // 2. Trigger native Android Share Sheet so user can pick Galeri, WhatsApp, Save to Files, etc.
        await Share.share({
          title: filename,
          text: 'Hasil Ekspor Video Hand Drawn Hilal',
          url: savedFileUri,
          dialogTitle: 'Simpan ke Perangkat / Bagikan Video'
        });

        return;
      } catch (nativeErr) {
        console.warn('Native Capacitor export error, falling back to Web Share:', nativeErr);
      }
    }

    // 3. Try Native Web Share API if supported
    const mimeType = blob.type || (filename.endsWith('.webm') ? 'video/webm' : filename.endsWith('.png') ? 'image/png' : 'application/octet-stream');
    const file = new File([blob], filename, { type: mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: filename,
          text: 'Hand Draw Animation Export'
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // 4. Fallback anchor link download for standard browsers
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setIsDone(false);

    try {
      if (format === 'animated-svg' || format === 'svg') {
        const svgString = generateAnimatedSvg(project);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        await downloadBlob(blob, `hand_draw_animation_${project.id}.svg`);
      } else if (format === 'png') {
        const blob = await exportHighResPng(project, quality);
        await downloadBlob(blob, `hand_draw_frame_${project.id}.png`);
      } else if (format === 'mp4' || format === 'webm') {
        const { blob, filename } = await exportVideo(
          project,
          { format, quality, fps: 30, transparentBackground: false, includeHandCursor: includeHand },
          (p) => setProgress(p)
        );
        await downloadBlob(blob, filename);
      } else if (format === 'zip-frames') {
        const blob = await exportZipFrames(
          project,
          { format, quality, fps: 24, transparentBackground: false, includeHandCursor: includeHand },
          (p) => setProgress(p)
        );
        await downloadBlob(blob, `hand_draw_frames_${project.id}.zip`);
      }

      setIsDone(true);
    } catch {
      // Handle error
    } finally {
      setIsExporting(false);
    }
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
                Export to MP4 / WebM video, Animated SVG, PNG snapshot, or Frame sequence ZIP.
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
              onClick={() => setFormat('mp4')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                format === 'mp4'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Film className="w-5 h-5 text-indigo-500" />
              <div>
                <h4 className="font-bold text-xs">MP4 Video</h4>
                <p className="text-[10px] text-slate-500">Universal HD MP4 Format</p>
              </div>
            </button>

            <button
              onClick={() => setFormat('webm')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                format === 'webm'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Film className="w-5 h-5 text-blue-500" />
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
              <FileImage className="w-5 h-5 text-sky-500" />
              <div>
                <h4 className="font-bold text-xs">High-Res PNG</h4>
                <p className="text-[10px] text-slate-500">Static line drawing snapshot</p>
              </div>
            </button>
          </div>
        </div>

        {/* Export Quality Selector */}
        {(format === 'mp4' || format === 'webm' || format === 'png') && (
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
        {(format === 'mp4' || format === 'webm') && (
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

        {/* Android Storage Tip */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-600 dark:text-indigo-400">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Petunjuk Khusus Pengguna HP Android / APK:</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Saat mengklik tombol di bawah, dialog <strong>Bagikan / Simpan File Android</strong> akan terbuka. Pilih <strong>"Simpan ke Perangkat"</strong> atau <strong>"Pengelola File"</strong> agar berkas tersimpan ke memori HP (folder <strong>Unduhan / Download</strong>).
          </p>
        </div>

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
