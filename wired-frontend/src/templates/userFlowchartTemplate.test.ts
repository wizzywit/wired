import { describe, expect, it } from 'vitest';
import { buildUserFlowchartTemplateShapes } from './userFlowchartTemplate';

describe('buildUserFlowchartTemplateShapes', () => {
  it('includes arrows, flowchart body kinds, and text labels', () => {
    const shapes = buildUserFlowchartTemplateShapes();
    const kinds = shapes.map((s) => s.kind);
    expect(kinds.filter((k) => k === 'arrow').length).toBeGreaterThanOrEqual(4);
    expect(kinds).toContain('ellipse');
    expect(kinds).toContain('rect');
    expect(kinds).toContain('kite');
    expect(kinds.filter((k) => k === 'text').length).toBeGreaterThanOrEqual(5);
    expect(new Set(shapes.map((s) => s.id)).size).toBe(shapes.length);
  });
});
