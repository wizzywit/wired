import type { DrawShape } from '../theme/canvasTypes';
import { buildCreativeBrainstormingTemplateShapes } from './creativeBrainstormingTemplate';
import { buildProjectRetrospectiveTemplateShapes } from './projectRetrospectiveTemplate';
import { buildTeamKanbanTemplateShapes } from './teamKanbanTemplate';
import { buildUserFlowchartTemplateShapes } from './userFlowchartTemplate';

/**
 * Returns canvas shapes for a template id, or `null` if unknown / not implemented.
 */
export function getTemplateShapes(templateId: string): DrawShape[] | null {
  switch (templateId) {
    case 'user-flowchart':
      return buildUserFlowchartTemplateShapes();
    case 'project-retrospective':
      return buildProjectRetrospectiveTemplateShapes();
    case 'creative-brainstorming':
      return buildCreativeBrainstormingTemplateShapes();
    case 'team-kanban':
      return buildTeamKanbanTemplateShapes();
    default:
      return null;
  }
}
