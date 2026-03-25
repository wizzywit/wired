/** Browser canvas adapter — dot grid texture for Konva fillPattern. */
export function createDotPattern(dotColor: string, cell: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = cell;
  canvas.height = cell;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }
  ctx.fillStyle = dotColor;
  ctx.beginPath();
  ctx.arc(cell / 2, cell / 2, 1, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}
