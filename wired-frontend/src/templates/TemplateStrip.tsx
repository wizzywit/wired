import { Icon } from '../components/common/Icon';
import TemplateCard from './TemplateCard';
import { DASHBOARD_TEMPLATES } from './dashboardTemplateCatalog';
import { useTemplateUseCase } from './useTemplateUseCase';

export default function TemplateStrip({
  onCreateNew,
  createPending,
  onBrowseLibrary,
}: {
  onCreateNew: () => void;
  createPending: boolean;
  onBrowseLibrary?: () => void;
}) {
  const { handleCreateFromTemplate } = useTemplateUseCase();
  return (
    <div className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-outline">Start with a Template</h2>
        <button type="button" onClick={onBrowseLibrary} className="text-sm font-semibold text-primary hover:underline">
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
        {DASHBOARD_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            icon={template.icon}
            title={template.title}
            subtitle={template.subtitle}
            bg={template.bg}
            accent={template.accent}
            text={template.text}
            sub={template.sub}
            disabled={createPending || !template.implemented}
            onClick={template.implemented ? () => handleCreateFromTemplate(template.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
