import type { CanvasTool } from '../../../theme/canvasTypes';

export type ShapeTool = Extract<CanvasTool, 'rect' | 'circle' | 'triangle' | 'kite' | 'line' | 'arrow'>;

export const SHAPE_OPTIONS: {
  tool: ShapeTool;
  icon: string;
  label: string;
}[] = [
  { tool: 'rect', icon: 'crop_square', label: 'Rect' },
  { tool: 'circle', icon: 'circle', label: 'Circle' },
  { tool: 'triangle', icon: 'change_history', label: 'Triangle' },
  { tool: 'kite', icon: 'diamond', label: 'Kite' },
  { tool: 'line', icon: 'horizontal_rule', label: 'Line' },
  { tool: 'arrow', icon: 'north_east', label: 'Arrow' },
];

export function isShapeTool(tool: CanvasTool): tool is ShapeTool {
  return SHAPE_OPTIONS.some((option) => option.tool === tool);
}

export function getShapeButtonPresentation(tool: CanvasTool): {
  icon: string;
  label: string;
  active: boolean;
} {
  const defaultPresentation = { icon: 'pentagon', label: 'Shapes', active: false };
  if (!isShapeTool(tool)) return defaultPresentation;

  const selectedShape = SHAPE_OPTIONS.find((option) => option.tool === tool);
  if (!selectedShape) return defaultPresentation;

  return {
    icon: selectedShape.icon,
    label: selectedShape.label,
    active: true,
  };
}
