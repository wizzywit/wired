import { DASHBOARD_TEMPLATES } from './dashboardTemplateCatalog';
import { useTemplateUseCase } from './useTemplateUseCase';
import MobileTemplatePreview from './MobileTemplatePreview';

const MOBILE_TEMPLATE_ROW = DASHBOARD_TEMPLATES.slice(0, 3);

export default function MobileTemplate({ createPending }: { createPending: boolean }) {
  const { handleCreateFromTemplate } = useTemplateUseCase();

  return (
    <>
      {MOBILE_TEMPLATE_ROW.map((t) => (
        <MobileTemplatePreview
          key={t.id}
          title={t.title}
          disabled={createPending || !t.implemented}
          onClick={t.implemented ? () => handleCreateFromTemplate(t.id) : undefined}
        />
      ))}
    </>
  );
}
