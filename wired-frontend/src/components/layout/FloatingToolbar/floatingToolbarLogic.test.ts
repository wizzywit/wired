import { describe, expect, it } from 'vitest';
import { getShapeButtonPresentation, isShapeTool, SHAPE_OPTIONS } from './floatingToolbarLogic';
import type { CanvasTool } from '../../../theme/canvasTypes';

describe('isShapeTool', () => {
  it('returns true for shape tools', () => {
    for (const shape of SHAPE_OPTIONS) {
      expect(isShapeTool(shape.tool)).toBe(true);
    }
  });

  it('returns false for non-shape tools', () => {
    const nonShapeTools: CanvasTool[] = ['select', 'pen', 'text', 'sticky'];
    for (const tool of nonShapeTools) {
      expect(isShapeTool(tool)).toBe(false);
    }
  });
});

describe('getShapeButtonPresentation', () => {
  it('returns default button presentation for non-shape tools', () => {
    expect(getShapeButtonPresentation('select')).toEqual({
      icon: 'pentagon',
      label: 'Shapes',
      active: false,
    });
  });

  it('returns matching icon and label for active shape tool', () => {
    expect(getShapeButtonPresentation('arrow')).toEqual({
      icon: 'north_east',
      label: 'Arrow',
      active: true,
    });
  });
});
