/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Type Definitions
 */

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  pathData?: string; // SVG path command string d="..."
  length: number;
  startPoint: Point;
  endPoint: Point;
  width: number;
  opacity: number;
  color: string;
  duration: number; // relative duration allocation
  delay: number; // delay before this stroke starts
  order: number; // drawing sequence index
  layer: 'outline' | 'structure' | 'detail' | 'fill' | 'shading';
  confidence: number; // 0 to 1 confidence score of line extraction
  direction: number; // angle in degrees
  isClosed?: boolean;
}

export type DrawingStyleMode = 
  | 'REALISTIC_HAND'
  | 'CLEAN_WHITEBOARD'
  | 'PENCIL_SKETCH'
  | 'MARKER'
  | 'INK'
  | 'VECTOR_PRECISE'
  | 'AUTO';

export interface AnalysisSettings {
  grayscale: boolean;
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  threshold: number; // 0 to 255
  edgeSensitivity: number; // 1 to 10
  detailSensitivity: number; // 1 to 10
  noiseReduction: number; // 0 to 5
  skeletonization: boolean; // Enable Zhang-Suen thinning
  strokeSimplification: number; // 0.5 to 5.0 (tolerance for Ramer-Douglas-Peucker)
  minStrokeLength: number; // min pixels to keep as stroke
  strokeDensity: number; // 1 to 10 (Stroke / Sketch Density control)
  fillDensity: number; // 1 to 10 (Color Fill / In-Paint Density control)
  invert: boolean;
  autoTraceSvg: boolean;
}

export interface DrawingSettings {
  strokeWidth: number;
  strokeOpacity: number;
  drawingSpeed: number; // multiplier 0.5x to 3x
  pressureVariation: number; // 0 to 1
  smoothness: number; // 0 to 5
  handJitter: number; // 0 to 10
  naturalVariation: number; // 0 to 10
  strokeOrderPriority: 'left-to-right' | 'smart' | 'length' | 'top-down' | 'bottom-up' | 'outside-in';
  showHandCursor: boolean;
  handType: 'pen' | 'pencil' | 'marker' | 'whiteboard-marker';
  concurrentStrokes: number; // 1 to 4 hands/pens drawing together
}

export interface AnimationSettings {
  duration: number; // Total duration in seconds
  startDelay: number; // seconds before drawing begins
  endDelay: number; // seconds hold after completion
  easing: 'linear' | 'ease-in-out' | 'cubic-bezier' | 'natural-hand';
  loop: boolean;
  reverse: boolean;
}

export interface BackgroundSettings {
  type: 'transparent' | 'white' | 'black' | 'grid' | 'paper' | 'original' | 'custom';
  customColor: string;
  originalOpacity: number; // 0 to 1 when showing original image in background
}

export interface ViewSettings {
  showOriginal: boolean;
  showDrawingPath: boolean;
  showSkeleton: boolean;
  showEdges: boolean;
  showNodes: boolean;
  showStrokeNumbers: boolean;
  selectedStrokeId: string | null;
  activeTab: 'import' | 'analysis' | 'drawing' | 'style' | 'animation' | 'background' | 'inspector';
}

export interface DeveloperDebugInfo {
  enabled: boolean;
  fps: number;
  processingTimeMs: number;
  detectedEdgesCount: number;
  skeletonPixelCount: number;
  extractedStrokeCount: number;
  totalPathLengthPx: number;
  workerActive: boolean;
  memoryUsageMb?: number;
}

export interface AnimationProject {
  id: string;
  name: string;
  sourceType: 'raster' | 'svg' | 'preset';
  sourceUrl: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
  aspectRatioPreset?: '16:9' | '4:3' | '1:1' | '9:16' | 'auto';
  strokes: Stroke[];
  analysisSettings: AnalysisSettings;
  drawingSettings: DrawingSettings;
  animationSettings: AnimationSettings;
  backgroundSettings: BackgroundSettings;
  styleMode: DrawingStyleMode;
}

export interface ExportOptions {
  format: 'webm' | 'svg' | 'animated-svg' | 'png' | 'zip-frames';
  quality: '720p' | '1080p' | '4k';
  fps: number;
  transparentBackground: boolean;
  includeHandCursor: boolean;
}

export interface ImageProcessingProgress {
  status: 'idle' | 'analyzing' | 'detecting-edges' | 'skeletonizing' | 'extracting-strokes' | 'organizing' | 'ready' | 'error';
  progress: number; // 0 to 100
  message: string;
}
