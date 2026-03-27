import { useState } from 'react';
import { colorForUserId, initialsFromAwarenessUser, KonvaCanvas } from './canvas';
import { AppTopNav } from '../components/layout/AppTopNav/AppTopNav';
import { FloatingToolbar } from '../components/layout/FloatingToolbar/FloatingToolbar';
import { Icon } from '../components/common/Icon';
import { presenceGlowStyle } from './canvasScreenLogic';
import { useCanvasScreenInnerUseCase } from './useCanvasScreenInnerUseCase';
import { ShareDialog } from '../share';

export default function CanvasScreenInner({
  documentId,
  documentTitle,
  documentOwnerId,
  canEdit,
}: {
  documentId: string;
  documentTitle: string;
  documentOwnerId: string;
  canEdit: boolean;
}) {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    usersOnline,
    isSynced,
    localUserId,
    presenceFaceUsers,
    presenceOverflow,
    handleRenameBreadcrumb,
    collaboration,
    worldBoundsToFitOnce,
    clearWorldBoundsToFitOnce,
  } = useCanvasScreenInnerUseCase({ documentId });
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="h-dvh overflow-hidden bg-background font-body text-on-background">
      <AppTopNav
        breadcrumb={documentTitle}
        onRenameBreadcrumb={localUserId === documentOwnerId ? handleRenameBreadcrumb : undefined}
        onShareClick={() => setShareOpen(true)}
        presence={
          <div className="mr-2 hidden items-center sm:flex" title={isSynced ? `${usersOnline} online` : 'Connecting…'}>
            <div className="-space-x-2 flex">
              {presenceFaceUsers.map((u) => {
                const accent = colorForUserId(u.id);
                return (
                  <div
                    key={u.id}
                    className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold leading-none tracking-tight text-white dark:border-slate-800"
                    style={presenceGlowStyle(accent)}
                    title={u.displayName?.trim() || u.email}
                  >
                    {initialsFromAwarenessUser(u)}
                  </div>
                );
              })}
              {presenceOverflow > 0 ? (
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-surface-container-high text-[10px] font-bold text-on-surface-variant shadow-[0_0_0_1px_rgba(255,255,255,0.85),0_1px_3px_rgba(0,0,0,0.08)] dark:border-slate-800">
                  +{presenceOverflow}
                </div>
              ) : null}
            </div>
          </div>
        }
      />
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        documentId={documentId}
        documentTitle={documentTitle}
      />

      {canEdit ? <FloatingToolbar variant="canvas" /> : null}

      <main className={`relative ml-0 mt-14 h-[calc(100dvh-3.5rem)] w-full overflow-hidden ${canEdit ? 'md:ml-20' : ''}`}>
        <KonvaCanvas
          collaboration={collaboration}
          readOnly={!canEdit}
          worldBoundsToFit={worldBoundsToFitOnce}
          onWorldBoundsFitConsumed={clearWorldBoundsToFitOnce}
        />
      </main>

      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-white/85 p-1.5 shadow-lg backdrop-blur-xl dark:bg-slate-900/85">
        <div className="px-2 text-[9px] font-bold uppercase tracking-tighter text-slate-500">
          {isSynced ? `${usersOnline} online` : 'syncing...'}
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" />
        <button
          type="button"
          className="flex flex-col items-center text-slate-400 enabled:hover:text-blue-500 disabled:opacity-30"
          disabled={!canUndo}
          onClick={() => undo()}
        >
          <Icon name="undo" size="sm" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Undo</span>
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-600" />
        <button
          type="button"
          className="flex flex-col items-center text-slate-400 enabled:hover:text-blue-500 disabled:opacity-30"
          disabled={!canRedo}
          onClick={() => redo()}
        >
          <Icon name="redo" size="sm" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Redo</span>
        </button>
      </div>
    </div>
  );
}
