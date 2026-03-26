import { AppTopNav } from '../components/layout/AppTopNav/AppTopNav';
import { FloatingToolbar } from '../components/layout/FloatingToolbar/FloatingToolbar';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { Icon } from '../components/common/Icon';
import { SearchField } from '../components/common/SearchField';
import { useSearchParams } from 'react-router-dom';
import MobileTemplatePreview from './MobileTemplatePreview';
import RecentBoards from './RecentBoards';
import TemplateStrip from './TemplateStrip';
import WorkspaceNav from './WorkspaceNav';
import { useNowMs } from '../hooks';
import { formatDocumentEditedLabel } from './dashboardScreenLogic';
import { useDashboardScreenUseCase } from './useDashboardScreenUseCase';

export default function DashboardScreen() {
  const [searchParams] = useSearchParams();
  const nowMs = useNowMs();
  const {
    viewState,
    documents,
    docsQueryPending,
    createPending,
    deletePending,
    handleCreate,
    openDocument,
    requestDeleteDocument,
    cancelDeleteDocument,
    confirmDeleteDocument,
    pendingDeleteDocument,
    documentsViewMode,
    setDocumentsViewMode,
  } = useDashboardScreenUseCase();

  if (viewState === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background font-body text-on-background">
        <p className="text-sm text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-12">
      <AppTopNav />
      <FloatingToolbar />
      {searchParams.get('notice') === 'document-unavailable' ? (
        <div className="mx-auto mt-16 w-full max-w-7xl px-6 md:px-8">
          <div className="rounded-xl border border-amber-400/30 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100">
            This document is no longer available. It may have been deleted by the owner.
          </div>
        </div>
      ) : null}

      {/* Desktop main */}
      <main className="hidden min-h-screen pt-14 md:ml-24 md:block md:px-8 md:pb-12">
        <header className="mx-auto max-w-7xl py-12">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Studio Browser</h1>
              <p className="max-w-md text-on-surface-variant">
                Open a document to join its canvas room, or create a new board.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <SearchField placeholder="Search boards, templates, or teams..." />
            </div>
          </div>

          <TemplateStrip onCreateNew={() => void handleCreate()} createPending={createPending} />

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
            <WorkspaceNav className="lg:col-span-3" />
            <RecentBoards
              className="lg:col-span-9"
              documents={documents}
              isLoading={docsQueryPending}
              isDeleting={deletePending}
              onOpen={openDocument}
              onDelete={requestDeleteDocument}
              viewMode={documentsViewMode}
              onChangeViewMode={setDocumentsViewMode}
              nowMs={nowMs}
            />
          </div>
        </header>
      </main>

      {/* Mobile main */}
      <main className="mt-20 space-y-8 px-6 md:hidden">
        <SearchField placeholder="Search boards, templates, or teams..." />
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-sm font-bold uppercase tracking-tight text-on-surface opacity-60">
              Start with a template
            </h2>
            <span className="cursor-pointer text-xs font-semibold text-primary">View All</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={createPending}
              onClick={() => void handleCreate()}
              className="group flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container p-4 text-white shadow-lg shadow-primary/20 transition-transform enabled:active:scale-95 disabled:opacity-50"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Icon name="add" size="sm" />
              </div>
              <span className="text-[13px] font-bold tracking-tight">Create New</span>
            </button>
            <MobileTemplatePreview title="Project Retrospective" />
            <MobileTemplatePreview title="Creative Brainstorming" />
            <MobileTemplatePreview title="User Flowchart" />
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-tight text-on-surface opacity-60">Your documents</h2>
          <div className="space-y-3">
            {docsQueryPending ? (
              <p className="text-sm text-on-surface-variant">Loading documents…</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No documents yet. Tap Create New to start.</p>
            ) : (
              documents.map((r) => (
                <article
                  key={r.id}
                  className="flex w-full cursor-pointer items-center gap-4 rounded-xl bg-surface-container-lowest p-3 text-left shadow-sm transition-all active:scale-[0.98] dark:bg-surface-container"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
                    <div className="absolute inset-0 p-2 opacity-50">
                      <div className="mb-1 h-2 w-full rounded-full bg-primary/20" />
                      <div className="h-2 w-2/3 rounded-full bg-primary/20" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDocument(r.id)}
                    className="min-w-0 flex-grow text-left"
                  >
                    <h3 className="truncate text-sm font-bold text-on-surface">{r.title}</h3>
                    <p className="mt-0.5 text-[11px] font-medium text-on-surface-variant">
                      {formatDocumentEditedLabel(r.updatedAt, nowMs)}
                    </p>
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="p-2 text-slate-400" aria-hidden>
                      <Icon name="chevron_right" size="sm" />
                    </span>
                    <button
                      type="button"
                      disabled={deletePending}
                      onClick={() => requestDeleteDocument(r.id)}
                      className="rounded-md p-2 text-slate-400 transition-colors enabled:hover:text-red-600 disabled:opacity-40"
                      aria-label={`Delete ${r.title}`}
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <MobileBottomNav />

      <button
        type="button"
        disabled={createPending}
        onClick={() => void handleCreate()}
        className="action-gradient fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl shadow-blue-500/40 transition-transform hover:scale-110 enabled:active:scale-90 disabled:opacity-50 md:bottom-8"
        aria-label="Create new document"
      >
        <Icon name="add" filled className="text-2xl text-white" />
      </button>

      {pendingDeleteDocument ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl dark:bg-surface-container">
            <h3 className="text-lg font-bold text-on-surface">Delete document?</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              This will permanently remove <strong>{pendingDeleteDocument.title}</strong> and its canvas data.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDeleteDocument}
                className="rounded-md px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
                disabled={deletePending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteDocument()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                disabled={deletePending}
              >
                {deletePending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
