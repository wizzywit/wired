import type { DrawShape } from '../theme/canvasTypes';
import { newId, STICKY_COLOR_PRESETS } from '../theme/canvasTypes';

const TEXT = '#1e293b';

/**
 * Open brainstorm grid: six sticky slots with starter prompts.
 */
export function buildCreativeBrainstormingTemplateShapes(): DrawShape[] {
  const labels = [
    'Core idea',
    'Stretch goal',
    'Risk / concern',
    'How might we…',
    'Borrow from others',
    'Next experiment',
  ];

  const cols = 3;
  const cellW = 200;
  const cellH = 130;
  const gapX = 32;
  const gapY = 28;
  const startX = 120;
  const startY = 140;

  const shapes: DrawShape[] = [
    {
      id: newId(),
      kind: 'text',
      x: 200,
      y: 56,
      width: 400,
      text: 'Creative brainstorming',
      fontSize: 22,
      fill: TEXT,
      align: 'center',
      fontStyle: 'bold',
    },
    {
      id: newId(),
      kind: 'text',
      x: 160,
      y: 96,
      width: 480,
      text: 'Capture every idea — refine later.',
      fontSize: 13,
      fill: '#64748b',
      align: 'center',
    },
  ];

  labels.forEach((label, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const preset = STICKY_COLOR_PRESETS[i % STICKY_COLOR_PRESETS.length]!;
    shapes.push({
      id: newId(),
      kind: 'sticky',
      x: startX + col * (cellW + gapX),
      y: startY + row * (cellH + gapY),
      width: cellW,
      height: cellH,
      text: label,
      fill: preset.fill,
      textColor: preset.textColor,
      fontSize: 13,
      align: 'left',
    });
  });

  return shapes;
}
