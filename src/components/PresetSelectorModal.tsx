/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Preset Gallery Modal
 */

import React from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { PRESET_DRAWINGS, PresetItem } from '../presets/presetData';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetItem) => void;
  currentPresetId?: string;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  currentPresetId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Sample Drawing Presets</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a pre-built vector or line art sample to test hand-drawing animations instantly.
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

        {/* Preset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {PRESET_DRAWINGS.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`p-4 rounded-xl border text-left transition-all flex gap-3 items-start ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className="w-16 h-16 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 text-slate-900 dark:text-slate-100 shrink-0"
                  dangerouslySetInnerHTML={{ __html: preset.thumbnailSvg }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {preset.name}
                    </h3>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </div>
                  <span className="inline-block my-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                    {preset.category}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
