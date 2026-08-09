/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Stroke Inspector Component
 */

import React from 'react';
import {
  RotateCw,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Wand2,
  X,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import { Stroke } from '../engine/types';

interface StrokeInspectorProps {
  stroke: Stroke | null;
  onClose: () => void;
  onReverseStroke: (id: string) => void;
  onDeleteStroke: (id: string) => void;
  onDuplicateStroke: (id: string) => void;
  onMoveOrder: (id: string, delta: number) => void;
  onAutoOrganize: () => void;
}

export const StrokeInspector: React.FC<StrokeInspectorProps> = ({
  stroke,
  onClose,
  onReverseStroke,
  onDeleteStroke,
  onDuplicateStroke,
  onMoveOrder,
  onAutoOrganize
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl space-y-4 max-w-sm w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
            #{stroke ? stroke.order : '*'}
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wide">
              {stroke ? `STROKE INSPECTOR` : 'NO STROKE SELECTED'}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {stroke ? stroke.id : 'Click a stroke line on canvas to inspect'}
            </p>
          </div>
        </div>

        {stroke && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {stroke ? (
        <>
          {/* Stroke Data Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] uppercase block">Length</span>
              <span className="font-bold text-indigo-300">{stroke.length} px</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] uppercase block">Layer</span>
              <span className="font-bold text-emerald-400 capitalize">{stroke.layer}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] uppercase block">Direction</span>
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Compass className="w-3 h-3" /> {Math.round(stroke.direction)}°
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] uppercase block">Confidence</span>
              <span className="font-bold text-blue-300">{Math.round(stroke.confidence * 100)}%</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] uppercase block">Start Point</span>
              <span className="font-bold text-slate-300">
                ({Math.round(stroke.startPoint.x)}, {Math.round(stroke.startPoint.y)})
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] uppercase block">End Point</span>
              <span className="font-bold text-slate-300">
                ({Math.round(stroke.endPoint.x)}, {Math.round(stroke.endPoint.y)})
              </span>
            </div>
          </div>

          {/* Individual Stroke Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onReverseStroke(stroke.id)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-400" /> Reverse Path
            </button>

            <button
              onClick={() => onDuplicateStroke(stroke.id)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" /> Duplicate
            </button>

            <button
              onClick={() => onMoveOrder(stroke.id, -1)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" /> Move Earlier
            </button>

            <button
              onClick={() => onMoveOrder(stroke.id, 1)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" /> Move Later
            </button>

            <button
              onClick={() => onDeleteStroke(stroke.id)}
              className="col-span-2 py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete Stroke
            </button>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-400">
          Select any stroke line on the preview canvas to inspect its parameters or modify its drawing sequence.
        </p>
      )}

      {/* Auto Organize Strokes Button */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={onAutoOrganize}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-indigo-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Wand2 className="w-4 h-4 text-amber-300" /> AUTO ORGANIZE ALL STROKES
        </button>
      </div>
    </div>
  );
};
