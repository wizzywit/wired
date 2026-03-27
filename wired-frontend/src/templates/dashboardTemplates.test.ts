import { describe, expect, it } from 'vitest';
import { buildCreativeBrainstormingTemplateShapes } from './creativeBrainstormingTemplate';
import { buildProjectRetrospectiveTemplateShapes } from './projectRetrospectiveTemplate';
import { buildTeamKanbanTemplateShapes } from './teamKanbanTemplate';
import { getTemplateShapes } from './getTemplateShapes';

describe('getTemplateShapes', () => {
  it('returns shapes for all dashboard template ids', () => {
    const ids = ['user-flowchart', 'project-retrospective', 'creative-brainstorming', 'team-kanban'] as const;
    for (const id of ids) {
      const shapes = getTemplateShapes(id);
      expect(shapes).not.toBeNull();
      expect(shapes!.length).toBeGreaterThan(0);
      expect(new Set(shapes!.map((s) => s.id)).size).toBe(shapes!.length);
    }
  });
});

describe('buildProjectRetrospectiveTemplateShapes', () => {
  it('uses stickies and column headers', () => {
    const shapes = buildProjectRetrospectiveTemplateShapes();
    const kinds = shapes.map((s) => s.kind);
    expect(kinds.filter((k) => k === 'sticky').length).toBeGreaterThanOrEqual(6);
    expect(kinds).toContain('rect');
  });
});

describe('buildCreativeBrainstormingTemplateShapes', () => {
  it('creates a grid of stickies', () => {
    const shapes = buildCreativeBrainstormingTemplateShapes();
    expect(shapes.filter((s) => s.kind === 'sticky').length).toBe(6);
  });
});

describe('buildTeamKanbanTemplateShapes', () => {
  it('includes rounded cards', () => {
    const shapes = buildTeamKanbanTemplateShapes();
    const rounded = shapes.filter((s) => s.kind === 'rect' && s.cornerRadius != null && s.cornerRadius > 0);
    expect(rounded.length).toBeGreaterThan(0);
  });
});
