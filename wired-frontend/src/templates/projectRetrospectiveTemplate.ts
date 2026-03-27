import type { DrawShape } from '../theme/canvasTypes';
import { newId, STICKY_COLOR_PRESETS } from '../theme/canvasTypes';
import { TEMPLATE_STROKE, TEMPLATE_STROKE_WIDTH } from './templateShared';

const TEXT = '#1e293b';

/**
 * Classic three-column retrospective: went well / challenges / actions.
 * Uses rects for column headers and stickies for notes.
 */
export function buildProjectRetrospectiveTemplateShapes(): DrawShape[] {
  const stroke = TEMPLATE_STROKE;
  const sw = TEMPLATE_STROKE_WIDTH;

  const colW = 228;
  const gap = 36;
  const startX = 72;
  const headerY = 120;
  const headerH = 48;

  const columns: { title: string; headerFill: string; stickyTexts: [string, string] }[] = [
    {
      title: 'Went well',
      headerFill: '#bbf7d0',
      stickyTexts: ['What should we keep doing?', 'Team highlight'],
    },
    {
      title: 'Challenges',
      headerFill: '#fecdd3',
      stickyTexts: ['What slowed us down?', 'What to improve'],
    },
    {
      title: 'Action items',
      headerFill: '#bfdbfe',
      stickyTexts: ['Owner + deadline', 'Next step'],
    },
  ];

  const shapes: DrawShape[] = [
    {
      id: newId(),
      kind: 'text',
      x: 260,
      y: 48,
      width: 360,
      text: 'Project retrospective',
      fontSize: 22,
      fill: TEXT,
      align: 'center',
      fontStyle: 'bold',
    },
  ];

  columns.forEach((col, i) => {
    const x = startX + i * (colW + gap);
    shapes.push({
      id: newId(),
      kind: 'rect',
      x,
      y: headerY,
      width: colW,
      height: headerH,
      stroke,
      strokeWidth: sw,
      fill: col.headerFill,
      fillOpacity: 0.95,
    });
    shapes.push({
      id: newId(),
      kind: 'text',
      x: x + 12,
      y: headerY + 14,
      width: colW - 24,
      text: col.title,
      fontSize: 15,
      fill: TEXT,
      align: 'center',
      fontStyle: 'bold',
    });

    col.stickyTexts.forEach((label, row) => {
      const preset = STICKY_COLOR_PRESETS[(i + row) % STICKY_COLOR_PRESETS.length]!;
      const sy = headerY + headerH + 28 + row * 130;
      shapes.push({
        id: newId(),
        kind: 'sticky',
        x: x + 8,
        y: sy,
        width: colW - 16,
        height: 112,
        text: label,
        fill: preset.fill,
        textColor: preset.textColor,
        fontSize: 13,
        align: 'left',
      });
    });
  });

  return shapes;
}
