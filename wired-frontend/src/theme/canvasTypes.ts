/** Line / border stroke pattern (Konva `dash`). */
export type StrokeDashPreset = 'solid' | 'dashed' | 'dotted' | 'dashDot';

export type CanvasTool =
  | 'select'
  | 'pen'
  | 'rect'
  | 'roundRect'
  | 'circle'
  | 'triangle'
  | 'kite'
  | 'line'
  | 'arrow'
  | 'text'
  | 'sticky';

export const STICKY_COLOR_PRESETS = [
  { id: 'lemon', label: 'Lemon', fill: '#fef08a', textColor: '#422006' },
  { id: 'pink', label: 'Pink', fill: '#fbcfe8', textColor: '#4c0519' },
  { id: 'mint', label: 'Mint', fill: '#bbf7d0', textColor: '#14532d' },
  { id: 'sky', label: 'Sky', fill: '#bfdbfe', textColor: '#172554' },
  { id: 'lavender', label: 'Lavender', fill: '#e9d5ff', textColor: '#3b0764' },
] as const;

export type DrawShape =
  | {
      id: string;
      kind: 'path';
      points: number[];
      stroke: string;
      strokeWidth: number;
      strokeDash?: StrokeDashPreset;
    }
  | {
      id: string;
      kind: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      stroke: string;
      strokeWidth: number;
      fill?: string;
      /** 0–1; fill alpha without changing stroke */
      fillOpacity?: number;
      strokeDash?: StrokeDashPreset;
      /** Konva corner radius (0 = sharp) */
      cornerRadius?: number;
    }
  | {
      id: string;
      kind: 'ellipse';
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      stroke: string;
      strokeWidth: number;
      fill?: string;
      fillOpacity?: number;
      strokeDash?: StrokeDashPreset;
    }
  | {
      id: string;
      kind: 'triangle';
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
      stroke: string;
      strokeWidth: number;
      fill?: string;
      fillOpacity?: number;
      strokeDash?: StrokeDashPreset;
    }
  | {
      id: string;
      kind: 'kite';
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
      stroke: string;
      strokeWidth: number;
      fill?: string;
      fillOpacity?: number;
      strokeDash?: StrokeDashPreset;
    }
  | {
      id: string;
      kind: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke: string;
      strokeWidth: number;
      strokeDash?: StrokeDashPreset;
    }
  | {
      id: string;
      kind: 'arrow';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke: string;
      strokeWidth: number;
      strokeDash?: StrokeDashPreset;
    }
  | {
      id: string;
      kind: 'text';
      x: number;
      y: number;
      text: string;
      fontSize: number;
      fill: string;
      width: number;
      fontFamily?: string;
      fontStyle?: 'normal' | 'bold' | 'italic' | 'bold italic';
      align?: 'left' | 'center' | 'right';
    }
  | {
      id: string;
      kind: 'sticky';
      x: number;
      y: number;
      width: number;
      height: number;
      /** Degrees, Konva convention */
      rotation?: number;
      text: string;
      fill: string;
      textColor: string;
      /** 0–1 note background alpha */
      fillOpacity?: number;
      /** Legacy; sticky notes render with no border */
      stroke?: string;
      strokeWidth?: number;
      fontSize?: number;
      fontFamily?: string;
      fontStyle?: 'normal' | 'bold' | 'italic' | 'bold italic';
      align?: 'left' | 'center' | 'right';
    };

export function newId() {
  return `d-${crypto.randomUUID()}`;
}
