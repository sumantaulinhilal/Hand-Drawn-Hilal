/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Upload & Import Modal
 */

import React, { useState } from 'react';
import { Upload, Link, Clipboard, Camera, X, FileImage } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadImage: (sourceUrl: string, sourceType: 'raster' | 'svg') => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onLoadImage
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setErrorMsg('');
    const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');

    if (isSvg) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target?.result as string;
        onLoadImage(svgContent, 'svg');
        onClose();
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onLoadImage(dataUrl, 'raster');
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], 'clipboard_image.png', { type });
            processFile(file);
            return;
          }
        }
      }
      setErrorMsg('No image found in clipboard.');
    } catch {
      setErrorMsg('Unable to access clipboard. Use paste shortcut Ctrl+V or browse file.');
    }
  };

  const handleFetchUrl = () => {
    if (!urlInput.trim()) return;
    const isSvg = urlInput.endsWith('.svg');
    onLoadImage(urlInput.trim(), isSvg ? 'svg' : 'raster');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Import Image / Vector</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports PNG, JPG, WEBP, SVG, GIF, Clipboard paste, or URL.
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

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
            {errorMsg}
          </p>
        )}

        {/* Drag & Drop File Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'
              : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileImage className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Drag & Drop Image Here, or <span className="text-indigo-600 dark:text-indigo-400 underline">Browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP, SVG, GIF up to 20MB</p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*,.svg"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Action Buttons: Clipboard & Camera */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePasteClipboard}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Clipboard className="w-4 h-4 text-indigo-500" /> Paste Clipboard
          </button>

          <label className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Camera className="w-4 h-4 text-emerald-500" /> Mobile Camera
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        {/* URL Input */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Or Fetch Image from URL</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <button
              onClick={handleFetchUrl}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Load
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
