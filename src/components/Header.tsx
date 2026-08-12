/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Header Component
 */

import React from 'react';
import logoImg from '../assets/images/app_logo_1786543757879.jpg';
import {
  PenTool,
  Upload,
  Download,
  Sparkles,
  Bug,
  Smartphone,
  Moon,
  Sun,
  Layers
} from 'lucide-react';

interface HeaderProps {
  onOpenPresets: () => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  onOpenApkGuide: () => void;
  onToggleDebug: () => void;
  isDebugEnabled: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  strokeCount: number;
  statusText: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPresets,
  onOpenUpload,
  onOpenExport,
  onOpenApkGuide,
  onToggleDebug,
  isDebugEnabled,
  isDarkMode,
  onToggleDarkMode,
  strokeCount,
  statusText
}) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30 shrink-0">
          <img src={logoImg} alt="Hand Drawn Hilal Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            HAND DRAWN HILAL <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">STUDIO</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-2">
            <span>{statusText || 'Ready'}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              <Layers className="w-3 h-3" /> {strokeCount} Strokes
            </span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPresets}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          title="Try Sample Drawings"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="hidden md:inline">Presets Gallery</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import Image</span>
        </button>

        <button
          onClick={onOpenExport}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 my-auto mx-1" />

        {/* Developer Debug Toggle */}
        <button
          onClick={onToggleDebug}
          className={`p-2 rounded-lg text-xs transition-colors ${
            isDebugEnabled
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Developer Debug Panel"
        >
          <Bug className="w-4 h-4" />
        </button>

        {/* APK packaging guide */}
        <button
          onClick={onOpenApkGuide}
          className="p-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Android APK / Capacitor Packaging Guide"
        >
          <Smartphone className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark / Light Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
