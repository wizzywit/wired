import type { DrawShape } from '../theme/canvasTypes';
import { newId } from '../theme/canvasTypes';
import { DEFAULT_STROKE, STROKE_WIDTH } from '../collaboration-canvas/canvas/utils/canvasConfig';

const FILL = '#e3f2fd';
const FILL_OPACITY = 0.7;
const TEXT = '#1e3a5f';

/**
 * Linear user-journey flowchart: start → steps → decision → outcome → end.
 * Uses ellipse (terminals), rect (process), kite (decision diamond), arrow (connectors), text labels.
 */
export function buildUserFlowchartTemplateShapes(): DrawShape[] {
  const stroke = DEFAULT_STROKE;
  const sw = STROKE_WIDTH;

  const arrows: DrawShape[] = [
    {
      id: newId(),
      kind: 'arrow',
      x1: 400,
      y1: 118,
      x2: 400,
      y2: 172,
      stroke,
      strokeWidth: sw,
    },
    {
      id: newId(),
      kind: 'arrow',
      x1: 400,
      y1: 240,
      x2: 400,
      y2: 288,
      stroke,
      strokeWidth: sw,
    },
    {
      id: newId(),
      kind: 'arrow',
      x1: 400,
      y1: 392,
      x2: 400,
      y2: 444,
      stroke,
      strokeWidth: sw,
    },
    {
      id: newId(),
      kind: 'arrow',
      x1: 400,
      y1: 504,
      x2: 400,
      y2: 556,
      stroke,
      strokeWidth: sw,
    },
  ];

  const bodies: DrawShape[] = [
    {
      id: newId(),
      kind: 'ellipse',
      cx: 400,
      cy: 80,
      rx: 76,
      ry: 38,
      stroke,
      strokeWidth: sw,
      fill: FILL,
      fillOpacity: FILL_OPACITY,
    },
    {
      id: newId(),
      kind: 'rect',
      x: 292,
      y: 172,
      width: 216,
      height: 56,
      stroke,
      strokeWidth: sw,
      fill: FILL,
      fillOpacity: FILL_OPACITY,
    },
    {
      id: newId(),
      kind: 'kite',
      x: 342,
      y: 288,
      width: 116,
      height: 104,
      rotation: 0,
      stroke,
      strokeWidth: sw,
      fill: FILL,
      fillOpacity: FILL_OPACITY,
    },
    {
      id: newId(),
      kind: 'rect',
      x: 292,
      y: 444,
      width: 216,
      height: 56,
      stroke,
      strokeWidth: sw,
      fill: FILL,
      fillOpacity: FILL_OPACITY,
    },
    {
      id: newId(),
      kind: 'ellipse',
      cx: 400,
      cy: 596,
      rx: 76,
      ry: 38,
      stroke,
      strokeWidth: sw,
      fill: FILL,
      fillOpacity: FILL_OPACITY,
    },
  ];

  const labels: DrawShape[] = [
    {
      id: newId(),
      kind: 'text',
      x: 340,
      y: 70,
      width: 120,
      text: 'Start',
      fontSize: 15,
      fill: TEXT,
      align: 'center',
    },
    {
      id: newId(),
      kind: 'text',
      x: 300,
      y: 188,
      width: 200,
      text: 'Open application',
      fontSize: 14,
      fill: TEXT,
      align: 'center',
    },
    {
      id: newId(),
      kind: 'text',
      x: 330,
      y: 322,
      width: 140,
      text: 'Valid session?',
      fontSize: 13,
      fill: TEXT,
      align: 'center',
    },
    {
      id: newId(),
      kind: 'text',
      x: 300,
      y: 460,
      width: 200,
      text: 'Show home',
      fontSize: 14,
      fill: TEXT,
      align: 'center',
    },
    {
      id: newId(),
      kind: 'text',
      x: 340,
      y: 586,
      width: 120,
      text: 'End',
      fontSize: 15,
      fill: TEXT,
      align: 'center',
    },
  ];

  return [...arrows, ...bodies, ...labels];
}
