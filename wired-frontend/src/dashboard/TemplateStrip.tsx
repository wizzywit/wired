import { Icon } from '../components/common/Icon';
import TemplateCard from './TemplateCard';

export default function TemplateStrip({
  onCreateNew,
  createPending,
}: {
  onCreateNew: () => void;
  createPending: boolean;
}) {
  return (
    <div className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-outline">Start with a Template</h2>
        <button type="button" className="text-sm font-semibold text-primary hover:underline">
          Browse Library
        </button>
      </div>
      <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-6">
        <button
          type="button"
          disabled={createPending}
          onClick={onCreateNew}
          className="group flex h-60 w-48 flex-shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-outline-variant/30 transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary transition-transform group-hover:scale-110">
            <Icon name="add" filled />
          </div>
          <span className="text-sm font-semibold">Create New</span>
        </button>
        <TemplateCard
          icon="history"
          title="Project Retrospective"
          subtitle="Evaluate what worked and what didn't."
          bg="bg-secondary-fixed"
          accent="bg-secondary-container/30"
          text="text-on-secondary-fixed"
          sub="text-on-secondary-fixed-variant"
        />
        <TemplateCard
          icon="lightbulb"
          title="Creative Brainstorming"
          subtitle="Capture ideas with rapid sticky notes."
          bg="bg-tertiary-fixed"
          accent="bg-tertiary-container/20"
          text="text-on-tertiary-fixed"
          sub="text-on-tertiary-fixed-variant"
        />
        <TemplateCard
          icon="account_tree"
          title="User Flowchart"
          subtitle="Map out the architectural journey."
          bg="bg-primary-fixed"
          accent="bg-primary-container/20"
          text="text-on-primary-fixed"
          sub="text-on-primary-fixed-variant"
        />
        <div className="group flex h-60 w-64 flex-shrink-0 cursor-pointer flex-col rounded-2xl bg-surface-container-high p-6 shadow-sm transition-all hover:shadow-lg">
          <Icon name="view_kanban" className="mb-4 text-outline" />
          <h3 className="text-lg font-bold leading-tight text-on-surface">Team Kanban</h3>
          <p className="mt-2 text-sm text-on-surface-variant">Manage tasks and project phases.</p>
        </div>
      </div>
    </div>
  );
}
