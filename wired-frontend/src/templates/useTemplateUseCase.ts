import { findDashboardTemplate } from './dashboardTemplateCatalog';
import { getTemplateShapes } from './getTemplateShapes';
import { buildInitialYjsBase64FromShapes } from '../collaboration-canvas';
import { buildCanvasPathForDocumentId, useCreateDocumentMutation } from '../dashboard';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useTemplateUseCase() {
  const createMutation = useCreateDocumentMutation();
  const navigate = useNavigate();

  const handleCreateFromTemplate = useCallback(
    async (templateId: string) => {
      const def = findDashboardTemplate(templateId);
      if (!def?.implemented) return;
      const seeded = getTemplateShapes(templateId);
      if (!seeded?.length) return;
      try {
        const initialYjsBase64 = buildInitialYjsBase64FromShapes(seeded);
        const res = await createMutation.mutateAsync({
          title: def.defaultDocumentTitle,
          initialYjsBase64,
        });
        navigate(buildCanvasPathForDocumentId(res.document.id));
      } catch {
        /* surfaced via mutation state if needed */
      }
    },
    [createMutation, navigate]
  );

  return {
    handleCreateFromTemplate,
  };
}
