/**
 * Dashboard template metadata (cards + create-document titles).
 * `implemented: false` hides canvas seeding for that id in `getTemplateShapes`.
 */
export type DashboardTemplateId =
  | 'project-retrospective'
  | 'creative-brainstorming'
  | 'user-flowchart'
  | 'team-kanban';

export type DashboardTemplateDefinition = {
  id: DashboardTemplateId;
  title: string;
  subtitle: string;
  /** Default name for the new document */
  defaultDocumentTitle: string;
  icon: string;
  bg: string;
  accent: string;
  text: string;
  sub: string;
  implemented: boolean;
};

export const DASHBOARD_TEMPLATES: DashboardTemplateDefinition[] = [
  {
    id: 'project-retrospective',
    title: 'Project Retrospective',
    subtitle: "Evaluate what worked and what didn't.",
    defaultDocumentTitle: 'Project Retrospective',
    icon: 'history',
    bg: 'bg-secondary-fixed',
    accent: 'bg-secondary-container/30',
    text: 'text-on-secondary-fixed',
    sub: 'text-on-secondary-fixed-variant',
    implemented: true,
  },
  {
    id: 'creative-brainstorming',
    title: 'Creative Brainstorming',
    subtitle: 'Capture ideas with rapid sticky notes.',
    defaultDocumentTitle: 'Creative Brainstorming',
    icon: 'lightbulb',
    bg: 'bg-tertiary-fixed',
    accent: 'bg-tertiary-container/20',
    text: 'text-on-tertiary-fixed',
    sub: 'text-on-tertiary-fixed-variant',
    implemented: true,
  },
  {
    id: 'user-flowchart',
    title: 'User Flowchart',
    subtitle: 'Map out the architectural journey.',
    defaultDocumentTitle: 'User Flowchart',
    icon: 'account_tree',
    bg: 'bg-primary-fixed',
    accent: 'bg-primary-container/20',
    text: 'text-on-primary-fixed',
    sub: 'text-on-primary-fixed-variant',
    implemented: true,
  },
  {
    id: 'team-kanban',
    title: 'Team Kanban',
    subtitle: 'Manage tasks and project phases.',
    defaultDocumentTitle: 'Team Kanban',
    icon: 'view_kanban',
    bg: 'bg-surface-container-high',
    accent: 'bg-primary-container/20',
    text: 'text-on-surface',
    sub: 'text-on-surface-variant',
    implemented: true,
  },
];

export function findDashboardTemplate(id: string): DashboardTemplateDefinition | undefined {
  return DASHBOARD_TEMPLATES.find((t) => t.id === id);
}
