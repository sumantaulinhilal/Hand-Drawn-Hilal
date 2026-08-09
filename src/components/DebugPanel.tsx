/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Developer Debug Panel
 */

import React from 'react';
import { Bug, X, Activity, Cpu, Layers, Zap } from 'lucide-react';
import { DeveloperDebugInfo } from '../engine/types';

interface DebugPanelProps {
  debugInfo: DeveloperDebugInfo;
  onClose: () => void;
  edgeImageData?: ImageData | null;
  skeletonImageData?: ImageData | null;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  debugInfo,
  onClose,
  edgeImageData,
  skeletonImageData
}) => {
  if (!debugInfo.enabled) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white rounded-2xl p-4 shadow-2xl max-w-xs w-full space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-amber-400 tracking-wide">DEV DEBUG PANEL</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[9px] uppercase block">FPS</span>
          <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> {debugInfo.fps}
          </span>
        </div>

        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[9px] uppercase block">Process Time</span>
          <span className="font-bold text-indigo-400 text-sm flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> {debugInfo.processingTimeMs} ms
          </span>
        </div>

        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[9px] uppercase block">Sobel Edges</span>
          <span className="font-bold text-blue-400">{debugInfo.detectedEdgesCount.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[9px] uppercase block">Skeleton Px</span>
          <span className="font-bold text-emerald-400">{debugInfo.skeletonPixelCount.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 col-span-2">
          <span className="text-slate-500 text-[9px] uppercase block">Total Path Length</span>
          <span className="font-bold text-amber-300">{debugInfo.totalPathLengthPx.toLocaleString()} px</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
        <span>Worker Thread: {debugInfo.workerActive ? 'Active' : 'Idle'}</span>
        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
      </div>
    </div>
  );
};
