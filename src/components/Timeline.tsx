/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Timeline Editor Component
 */

import React from 'react';
import { Play, Pause, RotateCcw, Repeat, Zap, Users } from 'lucide-react';
import { AnimationFrameState } from '../engine/animationEngine';
import { AnimationProject } from '../engine/types';

interface TimelineProps {
  project: AnimationProject;
  frameState: AnimationFrameState;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSeek: (time: number) => void;
  onUpdateAnimationSettings: (updated: Partial<AnimationProject['animationSettings']>) => void;
  onUpdateDrawingSettings: (updated: Partial<AnimationProject['drawingSettings']>) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  frameState,
  isPlaying,
  onTogglePlay,
  onRestart,
  onSeek,
  onUpdateAnimationSettings,
  onUpdateDrawingSettings
}) => {
  const durationPresets = [5, 10, 15, 30, 60];

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col gap-3">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Playback Transport Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Restart Animation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => onUpdateAnimationSettings({ loop: !project.animationSettings.loop })}
              className={`p-2 rounded-xl transition-colors ${
                project.animationSettings.loop
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Toggle Loop"
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Time Display */}
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 ml-2">
              {frameState.currentTime.toFixed(1)}s / {frameState.totalDuration.toFixed(1)}s
            </span>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 hidden sm:inline">
              Duration:
            </span>
            {durationPresets.map((d) => (
              <button
                key={d}
                onClick={() => onUpdateAnimationSettings({ duration: d })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  project.animationSettings.duration === d
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>

          {/* Speed & Concurrent Pens */}
          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-500 dark:text-slate-400 font-medium hidden lg:inline">Speed:</span>
              <select
                value={project.drawingSettings.drawingSpeed}
                onChange={(e) => onUpdateDrawingSettings({ drawingSpeed: parseFloat(e.target.value) })}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={0.5}>0.5x (Slow)</option>
                <option value={1.0}>1.0x (Normal)</option>
                <option value={1.5}>1.5x (Fast)</option>
                <option value={2.0}>2.0x (Very Fast)</option>
                <option value={3.0}>3.0x (Ultra)</option>
              </select>
            </div>

            {/* Concurrent Pens */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-xs">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-500 dark:text-slate-400 font-medium hidden lg:inline">Pens:</span>
              <select
                value={project.drawingSettings.concurrentStrokes}
                onChange={(e) => onUpdateDrawingSettings({ concurrentStrokes: parseInt(e.target.value) })}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={1}>1 Pen</option>
                <option value={2}>2 Pens</option>
                <option value={3}>3 Pens</option>
                <option value={4}>4 Pens</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline Scrubber Bar */}
        <div className="relative group flex items-center">
          <input
            type="range"
            min={0}
            max={frameState.totalDuration || 1}
            step={0.05}
            value={frameState.currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
          />
          {/* Active Progress fill bar */}
          <div
            style={{ width: `${frameState.overallProgress * 100}%` }}
            className="absolute top-0 left-0 h-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
