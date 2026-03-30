import type { WireDocument } from '../domain-types';
import { Icon } from '../components/common/Icon';
import type { DashboardDocumentsViewMode } from './dashboardScreenLogic';
import { formatDocumentEditedLabel } from './dashboardScreenLogic';

export default function RecentBoards({
  className = '',
  sectionTitle = 'Your documents',
  emptyMessage = 'No documents yet. Use Create New above to start a collaborative canvas.',
  documents,
  isLoading,
  isDeleting,
  onOpen,
  onDelete,
  canDeleteDocument,
  viewMode,
  onChangeViewMode,
  nowMs,
}: {
  className?: string;
  /** Section heading (e.g. Team Boards vs Your documents). */
  sectionTitle?: string;
  /** Shown when the list is empty and not loading. */
  emptyMessage?: string;
  documents: WireDocument[];
  isLoading: boolean;
  isDeleting: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  canDeleteDocument: (doc: WireDocument) => boolean;
  viewMode: DashboardDocumentsViewMode;
  onChangeViewMode: (next: DashboardDocumentsViewMode) => void;
  nowMs: number;
}) {
  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-outline">{sectionTitle}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-lg p-1.5 ${
              viewMode === 'grid'
                ? 'bg-surface-container-high text-on-surface-variant'
                : 'text-outline'
            }`}
            aria-label="Grid view"
            onClick={() => onChangeViewMode('grid')}
          >
            <Icon name="grid_view" className="text-[20px]" />
          </button>
          <button
            type="button"
            className={`rounded-lg p-1.5 ${
              viewMode === 'list'
                ? 'bg-surface-container-high text-on-surface-variant'
                : 'text-outline'
            }`}
            aria-label="List view"
            onClick={() => onChangeViewMode('list')}
          >
            <Icon name="list" className="text-[20px]" />
          </button>
        </div>
      </div>
      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Loading documents…</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{emptyMessage}</p>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((r) => {
            const canDelete = canDeleteDocument(r);
            return (
            <article
              key={r.id}
              className="group overflow-hidden rounded-2xl bg-surface-container-lowest shadow-card transition-all duration-300 hover:shadow-cardHover dark:bg-surface-container"
            >
              <div className="relative aspect-video overflow-hidden bg-surface-container-low p-4">
                <div className="relative h-full overflow-hidden rounded-lg border border-outline-variant/20 bg-white p-2 shadow-sm dark:bg-surface-container-lowest">
                  <div className="mb-2 h-4 w-8 rounded-sm bg-secondary-fixed" />
                  <div className="mb-4 ml-6 h-4 w-12 rounded-sm bg-tertiary-fixed" />
                  <div className="h-10 w-20 rounded-md border border-primary-fixed" />
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <div className="h-4 w-4 rounded-full bg-primary-container" />
                    <div className="h-4 w-4 rounded-full bg-secondary-container" />
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 pr-2">
                  <button
                    type="button"
                    onClick={() => onOpen(r.id)}
                    className="truncate text-left text-sm font-bold text-on-surface hover:underline"
                  >
                    {r.title}
                  </button>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-outline">
                    {formatDocumentEditedLabel(r.updatedAt, nowMs)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="rounded-md p-1 text-outline transition-colors hover:text-on-surface"
                    aria-label={`Open ${r.title}`}
                    onClick={() => onOpen(r.id)}
                  >
                    <Icon name="open_in_new" className="text-lg" />
                  </button>
                  {canDelete ? (
                    <button
                      type="button"
                      disabled={isDeleting}
                      className="rounded-md p-1 text-outline transition-colors enabled:hover:text-red-600 disabled:opacity-40"
                      aria-label={`Delete ${r.title}`}
                      onClick={() => onDelete(r.id)}
                    >
                      <Icon name="delete" className="text-lg" />
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((r) => {
            const canDelete = canDeleteDocument(r);
            return (
            <article
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest p-3 dark:bg-surface-container"
            >
              <button
                type="button"
                onClick={() => onOpen(r.id)}
                className="min-w-0 flex-1 text-left"
              >
                <h4 className="truncate text-sm font-bold text-on-surface">{r.title}</h4>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-outline">
                  {formatDocumentEditedLabel(r.updatedAt, nowMs)}
                </p>
              </button>
              {canDelete ? (
                <button
                  type="button"
                  disabled={isDeleting}
                  className="rounded-md p-1 text-outline transition-colors enabled:hover:text-red-600 disabled:opacity-40"
                  aria-label={`Delete ${r.title}`}
                  onClick={() => onDelete(r.id)}
                >
                  <Icon name="delete" className="text-lg" />
                </button>
              ) : null}
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
