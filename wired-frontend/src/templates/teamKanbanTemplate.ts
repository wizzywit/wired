import type { DrawShape } from '../theme/canvasTypes';
import { newId } from '../theme/canvasTypes';
import {
  TEMPLATE_CARD_CORNER_RADIUS,
  TEMPLATE_STROKE,
  TEMPLATE_STROKE_WIDTH,
} from './templateShared';

const TEXT = '#0f172a';
const MUTED = '#64748b';

/**
 * Four-column Kanban with rounded cards (uses `rect` + `cornerRadius`).
 */
export function buildTeamKanbanTemplateShapes(): DrawShape[] {
  const stroke = TEMPLATE_STROKE;
  const sw = TEMPLATE_STROKE_WIDTH;
  const r = TEMPLATE_CARD_CORNER_RADIUS;

  const colW = 188;
  const gap = 24;
  const startX = 64;
  const headerY = 112;
  const headerH = 44;
  const cardH = 72;
  const cardGap = 12;

  const columns: { title: string; headerFill: string; cards: [string, string] }[] = [
    { title: 'Backlog', headerFill: '#e2e8f0', cards: ['New idea', 'Research spike'] },
    { title: 'To do', headerFill: '#fde68a', cards: ['Spec draft', 'Design review'] },
    { title: 'In progress', headerFill: '#a5b4fc', cards: ['Implementation', 'Tests'] },
    { title: 'Done', headerFill: '#86efac', cards: ['Shipped 🎉', 'Retro notes'] },
  ];

  const shapes: DrawShape[] = [
    {
      id: newId(),
      kind: 'text',
      x: 200,
      y: 48,
      width: 400,
      text: 'Team Kanban',
      fontSize: 22,
      fill: TEXT,
      align: 'center',
      fontStyle: 'bold',
    },
    {
      id: newId(),
      kind: 'text',
      x: 200,
      y: 84,
      width: 400,
      text: 'Drag cards across columns as work moves.',
      fontSize: 12,
      fill: MUTED,
      align: 'center',
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
      cornerRadius: 8,
    });
    shapes.push({
      id: newId(),
      kind: 'text',
      x: x + 8,
      y: headerY + 13,
      width: colW - 16,
      text: col.title,
      fontSize: 14,
      fill: TEXT,
      align: 'center',
      fontStyle: 'bold',
    });

    col.cards.forEach((cardLabel, row) => {
      const cy = headerY + headerH + 16 + row * (cardH + cardGap);
      shapes.push({
        id: newId(),
        kind: 'rect',
        x: x + 4,
        y: cy,
        width: colW - 8,
        height: cardH,
        stroke,
        strokeWidth: sw,
        fill: '#ffffff',
        fillOpacity: 0.92,
        cornerRadius: r,
      });
      shapes.push({
        id: newId(),
        kind: 'text',
        x: x + 16,
        y: cy + 26,
        width: colW - 32,
        text: cardLabel,
        fontSize: 13,
        fill: TEXT,
        align: 'left',
      });
    });
  });

  return shapes;
}
