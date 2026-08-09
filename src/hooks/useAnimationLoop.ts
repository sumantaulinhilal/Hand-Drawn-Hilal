/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Custom Animation Loop Hook
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateTimelineSchedule, evaluateAnimationFrame } from '../engine/animationEngine';
import { AnimationProject } from '../engine/types';

export function useAnimationLoop(project: AnimationProject) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fps, setFps] = useState(60);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(performance.now());

  // Calculate timeline schedule
  const { scheduledStrokes, computedTotalDuration } = calculateTimelineSchedule(
    project.strokes,
    project.animationSettings,
    project.drawingSettings.drawingSpeed,
    project.drawingSettings.concurrentStrokes
  );

  // Evaluate frame at current time
  const currentFrameState = evaluateAnimationFrame(
    currentTime,
    scheduledStrokes,
    computedTotalDuration,
    project.animationSettings.easing
  );

  const play = useCallback(() => {
    if (currentTime >= computedTotalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying(true);
    lastTimeRef.current = performance.now();
  }, [currentTime, computedTotalDuration]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(computedTotalDuration, time)));
  }, [computedTotalDuration]);

  const restart = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    lastTimeRef.current = performance.now();
  }, []);

  // Animation Loop Effect
  useEffect(() => {
    if (!isPlaying) return;

    const animate = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }

      const deltaSeconds = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Update FPS calculation
      frameCountRef.current++;
      if (now - fpsTimerRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current)));
        frameCountRef.current = 0;
        fpsTimerRef.current = now;
      }

      setCurrentTime((prev) => {
        const nextTime = prev + deltaSeconds;
        if (nextTime >= computedTotalDuration) {
          if (project.animationSettings.loop) {
            return 0;
          } else {
            setIsPlaying(false);
            return computedTotalDuration;
          }
        }
        return nextTime;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, computedTotalDuration, project.animationSettings.loop]);

  return {
    isPlaying,
    currentTime,
    computedTotalDuration,
    currentFrameState,
    scheduledStrokes,
    fps,
    play,
    pause,
    togglePlay,
    seek,
    restart
  };
}
