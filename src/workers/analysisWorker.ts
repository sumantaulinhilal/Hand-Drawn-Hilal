/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Analysis Web Worker
 */

import { detectEdges } from '../engine/edgeDetector';
import { extractStrokesFromSkeleton } from '../engine/strokeExtractor';
import { organizeStrokes } from '../engine/strokeOrganizer';
import { optimizeStroke } from '../engine/strokeOptimizer';
import { skeletonize } from '../engine/skeletonizer';
import { AnalysisSettings, DrawingSettings, Stroke } from '../engine/types';

export interface WorkerMessageData {
  type: 'ANALYZE_RASTER';
  imageData: ImageData;
  analysisSettings: AnalysisSettings;
  drawingSettings: DrawingSettings;
  canvasWidth: number;
  canvasHeight: number;
}

self.onmessage = (e: MessageEvent<WorkerMessageData>) => {
  const { type, imageData, analysisSettings, drawingSettings, canvasWidth, canvasHeight } = e.data;

  if (type === 'ANALYZE_RASTER') {
    try {
      // 1. Progress: Edge Detection
      self.postMessage({
        type: 'PROGRESS',
        status: 'detecting-edges',
        progress: 25,
        message: 'Detecting edges & contours...'
      });

      const edgeResult = detectEdges(imageData, analysisSettings);

      // 2. Progress: Skeletonization / Thinning
      self.postMessage({
        type: 'PROGRESS',
        status: 'skeletonizing',
        progress: 50,
        message: 'Skeletonizing lines into centerlines...'
      });

      const skeletonResult = skeletonize(
        edgeResult.binaryEdgeMap,
        edgeResult.width,
        edgeResult.height,
        25
      );

      // 3. Progress: Extract Strokes
      self.postMessage({
        type: 'PROGRESS',
        status: 'extracting-strokes',
        progress: 75,
        message: 'Tracing continuous stroke vectors...'
      });

      const rawStrokes = extractStrokesFromSkeleton(
        skeletonResult.skeletonMap,
        skeletonResult.width,
        skeletonResult.height,
        analysisSettings,
        imageData
      );

      // 4. Progress: Organize & Optimize
      self.postMessage({
        type: 'PROGRESS',
        status: 'organizing',
        progress: 90,
        message: 'Optimizing drawing sequence & smoothing...'
      });

      const optimizedStrokes = rawStrokes.map((s) => optimizeStroke(s, drawingSettings));
      const finalStrokes = organizeStrokes(optimizedStrokes, drawingSettings, canvasWidth, canvasHeight);

      // Post complete result
      self.postMessage({
        type: 'COMPLETE',
        strokes: finalStrokes,
        detectedEdgesCount: edgeResult.edgeCount,
        skeletonPixelCount: skeletonResult.pixelCount,
        edgeImageData: edgeResult.edgeImageData,
        skeletonImageData: skeletonResult.skeletonImageData
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      self.postMessage({
        type: 'ERROR',
        message: errorMsg
      });
    }
  }
};
