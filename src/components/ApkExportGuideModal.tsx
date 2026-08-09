/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Android APK Packaging Guide Modal
 */

import React from 'react';
import { Smartphone, Terminal, Code2, CheckCircle2, X } from 'lucide-react';

interface ApkExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportGuideModal: React.FC<ApkExportGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 transition-colors max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Convert to Android APK (Capacitor)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This app is modularized for standard web and Capacitor WebView Android packaging.
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

        {/* Step by step guide */}
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Step 1: Export Codebase
            </h3>
            <p className="text-slate-500 dark:text-slate-400 pl-6">
              Download or export the project source code using AI Studio ZIP export or Git repository export.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-500" /> Step 2: Install Capacitor Dependencies
            </h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1">
              <p>npm install @capacitor/core @capacitor/cli @capacitor/android</p>
              <p>npx cap init "Hand Draw Engine" "com.handdraw.app"</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-500" /> Step 3: Build & Sync Android Project
            </h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1">
              <p>npm run build</p>
              <p>npx cap add android</p>
              <p>npx cap sync</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-500" /> Step 4: Open Android Studio & Generate APK
            </h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
              <p>npx cap open android</p>
            </div>
            <p className="text-slate-500 dark:text-slate-400 pl-6">
              In Android Studio, select <strong className="text-slate-800 dark:text-slate-200">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> to generate your signed APK installer for smartphones.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
