import CanvasScreenInner from './CanvasScreenInner';
import { useCanvasGateUseCase } from './useCanvasGateUseCase';

export default function CanvasGate() {
  const { viewState, documentId, documentTitle, documentOwnerId, documentCanEdit } = useCanvasGateUseCase();

  if (viewState === 'redirecting') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background font-body text-on-background">
        <p className="text-sm text-on-surface-variant">Redirecting…</p>
      </div>
    );
  }

  if (viewState === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background font-body text-on-background">
        <p className="text-sm text-on-surface-variant">Loading document…</p>
      </div>
    );
  }

  return (
    <CanvasScreenInner
      documentId={documentId}
      documentTitle={documentTitle}
      documentOwnerId={documentOwnerId}
      canEdit={documentCanEdit}
    />
  );
}
