/**
 * @license
 * HAND DRAW ANIMATION ENGINE - Preset Sample Drawings
 */

export interface PresetItem {
  id: string;
  name: string;
  category: 'lineart' | 'cartoon' | 'logo' | 'sketch' | 'vector';
  description: string;
  thumbnailSvg: string;
  svgData: string;
}

export const PRESET_DRAWINGS: PresetItem[] = [
  {
    id: 'minimal-butterfly',
    name: 'Butterfly Line Art',
    category: 'lineart',
    description: 'Symmetrical elegant line art butterfly with delicate wing details.',
    thumbnailSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100" height="100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M150 70 C150 70 140 180 150 230 C160 180 150 70 150 70 Z" />
      <circle cx="150" cy="60" r="10" />
      <path d="M145 52 Q120 30 100 35 M155 52 Q180 30 200 35" />
      <path d="M148 80 C100 30 30 70 40 130 C45 160 80 180 148 160" />
      <path d="M152 80 C200 30 270 70 260 130 C255 160 220 180 152 160" />
      <path d="M148 165 C90 170 60 210 80 240 C100 260 135 230 148 190" />
      <path d="M152 165 C210 170 240 210 220 240 C200 260 165 230 152 190" />
    </svg>`,
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <!-- Body & Head -->
      <path d="M250 120 C248 180 245 320 250 380 C255 320 252 180 250 120 Z" stroke-width="5" />
      <circle cx="250" cy="100" r="16" stroke-width="5" />
      <!-- Antennae -->
      <path d="M242 88 C210 50 170 55 140 65" stroke-width="3" />
      <path d="M258 88 C290 50 330 55 360 65" stroke-width="3" />
      <circle cx="136" cy="66" r="4" fill="#1e293b" />
      <circle cx="364" cy="66" r="4" fill="#1e293b" />
      <!-- Left Upper Wing -->
      <path d="M245 140 C160 60 40 120 55 220 C65 270 130 290 245 260" stroke-width="4" />
      <path d="M240 160 C180 110 90 150 100 210 C105 240 150 255 240 235" stroke-width="3" />
      <path d="M150 170 C120 140 85 180 120 220" stroke-width="2" />
      <!-- Right Upper Wing -->
      <path d="M255 140 C340 60 460 120 445 220 C435 270 370 290 255 260" stroke-width="4" />
      <path d="M260 160 C320 110 410 150 400 210 C395 240 350 255 260 235" stroke-width="3" />
      <path d="M350 170 C380 140 415 180 380 220" stroke-width="2" />
      <!-- Left Lower Wing -->
      <path d="M245 270 C150 280 100 340 130 400 C160 430 220 380 245 310" stroke-width="4" />
      <path d="M235 285 C170 295 130 335 150 380 C170 400 215 365 235 320" stroke-width="3" />
      <!-- Right Lower Wing -->
      <path d="M255 270 C350 280 400 340 370 400 C340 430 280 380 255 310" stroke-width="4" />
      <path d="M265 285 C330 295 370 335 350 380 C330 400 285 365 265 320" stroke-width="3" />
    </svg>`
  },
  {
    id: 'handwritten-signature',
    name: 'Handwritten Calligraphy',
    category: 'sketch',
    description: 'Fluids cursive handwritten calligraphy reading "Hand Draw Engine".',
    thumbnailSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" width="100" height="50" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <path d="M20 90 Q30 30 40 40 T50 80 Q65 60 75 80 Q85 60 95 80 L110 80 M120 40 L120 90 Q140 60 160 80 L180 80 M200 40 Q220 80 240 40 L260 90" />
    </svg>`,
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="600" height="300" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <!-- 'H' -->
      <path d="M50 80 L50 200" stroke-width="6" />
      <path d="M50 140 Q90 120 110 140 L110 200" stroke-width="5" />
      <path d="M110 70 L110 140" stroke-width="6" />
      <!-- 'a' -->
      <path d="M150 160 C130 140 120 180 140 195 C160 200 170 170 170 140 L170 200" stroke-width="5" />
      <!-- 'n' -->
      <path d="M190 140 L190 200 M190 160 C210 135 230 140 230 200" stroke-width="5" />
      <!-- 'd' -->
      <path d="M270 160 C250 140 240 180 260 195 C280 200 290 170 290 90 L290 200" stroke-width="5" />
      <!-- Underline swoop -->
      <path d="M30 230 Q200 260 450 220 Q550 200 580 240" stroke-width="4" />
      <!-- 'Engine' -->
      <path d="M340 110 L340 200 M340 110 L390 110 M340 155 L380 155 M340 200 L390 200" stroke-width="6" />
      <path d="M410 140 L410 200 M410 160 C430 135 450 140 450 200" stroke-width="5" />
      <path d="M470 170 C460 140 500 130 500 165 L465 170 C465 195 500 205 510 185" stroke-width="5" />
    </svg>`
  },
  {
    id: 'architect-house',
    name: 'Architectural Blueprint',
    category: 'vector',
    description: 'Clean architectural sketch of a modern villa with geometric strokes.',
    thumbnailSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="80" height="80" fill="none" stroke="currentColor" stroke-width="3">
      <path d="M20 160 L180 160 M40 160 L40 90 L100 40 L160 90 L160 160" />
      <rect x="80" y="110" width="40" height="50" />
      <rect x="55" y="100" width="20" height="25" />
      <rect x="125" y="100" width="20" height="25" />
    </svg>`,
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="500" height="400" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <!-- Ground -->
      <line x1="30" y1="350" x2="470" y2="350" stroke-width="5" />
      <!-- Main House Body -->
      <rect x="80" y="180" width="340" height="170" stroke-width="4" />
      <!-- Roof Structure -->
      <path d="M50 180 L250 50 L450 180 Z" stroke-width="5" />
      <path d="M70 180 L250 75 L430 180" stroke-width="3" />
      <!-- Chimney -->
      <path d="M330 100 L330 60 L370 60 L370 130" stroke-width="4" />
      <!-- Door -->
      <rect x="220" y="250" width="60" height="100" stroke-width="4" />
      <circle cx="270" cy="300" r="4" fill="#1e293b" />
      <path d="M220 220 Q250 200 280 220" stroke-width="3" />
      <!-- Left Windows -->
      <rect x="110" y="210" width="70" height="60" stroke-width="3" />
      <line x1="145" y1="210" x2="145" y2="270" stroke-width="2" />
      <line x1="110" y1="240" x2="180" y2="240" stroke-width="2" />
      <!-- Right Windows -->
      <rect x="320" y="210" width="70" height="60" stroke-width="3" />
      <line x1="355" y1="210" x2="355" y2="270" stroke-width="2" />
      <line x1="320" y1="240" x2="390" y2="240" stroke-width="2" />
      <!-- Attic Circular Window -->
      <circle cx="250" cy="130" r="25" stroke-width="3" />
      <line x1="225" y1="130" x2="275" y2="130" stroke-width="2" />
      <line x1="250" y1="105" x2="250" y2="155" stroke-width="2" />
      <!-- Fence & Trees -->
      <path d="M30 350 L30 310 L50 310 L50 350 M50 320 L80 320" stroke-width="3" />
      <path d="M420 350 C400 300 410 250 440 230 C470 250 480 300 460 350" stroke-width="3" />
    </svg>`
  },
  {
    id: 'cartoon-cat',
    name: 'Cute Mascot Drawing',
    category: 'cartoon',
    description: 'Chibi cat character with smooth curves and expressive features.',
    thumbnailSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="80" height="80" fill="none" stroke="currentColor" stroke-width="3">
      <circle cx="100" cy="110" r="60" />
      <path d="M50 70 L30 20 L80 55 M150 70 L170 20 L120 55" />
      <circle cx="80" cy="100" r="8" fill="currentColor" />
      <circle cx="120" cy="100" r="8" fill="currentColor" />
      <path d="M95 115 L105 115 L100 122 Z" fill="currentColor" />
      <path d="M90 128 Q100 138 110 128" />
    </svg>`,
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450" width="400" height="450" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Head Contour -->
      <path d="M120 140 C80 160 70 240 100 290 C130 340 270 340 300 290 C330 240 320 160 280 140 C240 120 160 120 120 140 Z" stroke-width="6" />
      <!-- Left Ear -->
      <path d="M130 135 L80 40 C110 50 150 80 170 125" stroke-width="5" />
      <path d="M120 120 L90 60 C110 70 130 90 145 115" stroke-width="3" />
      <!-- Right Ear -->
      <path d="M270 135 L320 40 C290 50 250 80 230 125" stroke-width="5" />
      <path d="M280 120 L310 60 C290 70 270 90 255 115" stroke-width="3" />
      <!-- Eyes -->
      <ellipse cx="155" cy="200" rx="18" ry="24" fill="#111827" />
      <ellipse cx="245" cy="200" rx="18" ry="24" fill="#111827" />
      <circle cx="150" cy="190" r="6" fill="#ffffff" />
      <circle cx="240" cy="190" r="6" fill="#ffffff" />
      <!-- Nose & Mouth -->
      <polygon points="192,225 208,225 200,235" fill="#111827" />
      <path d="M180 245 Q200 260 200 240 Q200 260 220 245" stroke-width="4" />
      <!-- Whiskers -->
      <path d="M70 210 L120 215 M60 230 L115 230 M70 250 L120 242" stroke-width="4" />
      <path d="M330 210 L280 215 M340 230 L285 230 M330 250 L280 242" stroke-width="4" />
      <!-- Body -->
      <path d="M140 320 C120 370 130 410 160 420 L240 420 C270 410 280 370 260 320" stroke-width="5" />
      <path d="M180 330 C190 380 200 410 200 420" stroke-width="3" />
      <!-- Paws -->
      <path d="M140 410 C150 390 170 390 180 420" stroke-width="4" />
      <path d="M220 420 C230 390 250 390 260 410" stroke-width="4" />
    </svg>`
  },
  {
    id: 'tech-logo',
    name: 'Geometric Tech Emblem',
    category: 'logo',
    description: 'Precision geometric logo with interconnected nodes and continuous paths.',
    thumbnailSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="80" height="80" fill="none" stroke="currentColor" stroke-width="3">
      <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" />
      <polygon points="100,50 140,75 140,125 100,150 60,125 60,75" />
      <line x1="100" y1="20" x2="100" y2="50" />
      <line x1="170" y1="60" x2="140" y2="75" />
      <line x1="170" y1="140" x2="140" y2="125" />
      <line x1="100" y1="180" x2="100" y2="150" />
      <line x1="30" y1="140" x2="60" y2="125" />
      <line x1="30" y1="60" x2="60" y2="75" />
    </svg>`,
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Outer Hexagon -->
      <polygon points="200,30 340,110 340,270 200,350 60,270 60,110" stroke-width="6" />
      <!-- Inner Hexagon -->
      <polygon points="200,90 290,142 290,246 200,298 110,246 110,142" stroke-width="5" />
      <!-- Core Triangle -->
      <polygon points="200,130 260,230 140,230" stroke-width="5" />
      <!-- Interconnecting spokes -->
      <line x1="200" y1="30" x2="200" y2="90" stroke-width="4" />
      <line x1="340" y1="110" x2="290" y2="142" stroke-width="4" />
      <line x1="340" y1="270" x2="290" y2="246" stroke-width="4" />
      <line x1="200" y1="350" x2="200" y2="298" stroke-width="4" />
      <line x1="60" y1="270" x2="110" y2="246" stroke-width="4" />
      <line x1="60" y1="110" x2="110" y2="142" stroke-width="4" />
      <!-- Node Circles -->
      <circle cx="200" cy="30" r="7" fill="#2563eb" />
      <circle cx="340" cy="110" r="7" fill="#2563eb" />
      <circle cx="340" cy="270" r="7" fill="#2563eb" />
      <circle cx="200" cy="350" r="7" fill="#2563eb" />
      <circle cx="60" cy="270" r="7" fill="#2563eb" />
      <circle cx="60" cy="110" r="7" fill="#2563eb" />
      <circle cx="200" cy="190" r="12" stroke-width="4" />
    </svg>`
  }
];
