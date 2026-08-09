/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Canvas Pan & Zoom Hook
 */

import React, { useCallback, useRef, useState } from 'react';

export function useCanvasPanZoom() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const startPanRef = useRef({ x: 0, y: 0 });
  const initialPinchDistRef = useRef<number | null>(null);

  const resetPanZoom = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((prev) => Math.max(0.2, Math.min(5, prev * zoomFactor)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle click or Alt+Click for pan, or left click when space pressed
    if (e.button === 1 || e.altKey || e.shiftKey) {
      e.preventDefault();
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    }
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y
      });
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch gesture support for mobile pinch zoom & pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
    } else if (e.touches.length === 1) {
      setIsPanning(true);
      startPanRef.current = {
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      };
    }
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialPinchDistRef.current;
      setScale((prev) => Math.max(0.2, Math.min(5, prev * factor)));
      initialPinchDistRef.current = dist;
    } else if (e.touches.length === 1 && isPanning) {
      setOffset({
        x: e.touches[0].clientX - startPanRef.current.x,
        y: e.touches[0].clientY - startPanRef.current.y
      });
    }
  }, [isPanning]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    initialPinchDistRef.current = null;
  }, []);

  return {
    scale,
    offset,
    isPanning,
    setScale,
    setOffset,
    resetPanZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
