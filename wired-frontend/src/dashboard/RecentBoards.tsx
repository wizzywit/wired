import type { WireDocument } from '../domain-types';
import { Icon } from '../components/common/Icon';
import { formatDocumentEditedLabel } from './dashboardScreenLogic';

export default function RecentBoards({
  className = '',
  documents,
  isLoading,
  onOpen,
  nowMs,
}: {
  className?: string;
  documents: WireDocument[];
  isLoading: boolean;
  onOpen: (id: string) => void;
  nowMs: number;
}) {
  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-outline">Your documents</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg bg-surface-container-high p-1.5 text-on-surface-variant"
            aria-label="Grid view"
          >
            <Icon name="grid_view" className="text-[20px]" />
          </button>
          <button type="button" className="rounded-lg p-1.5 text-outline" aria-label="List view">
            <Icon name="list" className="text-[20px]" />
          </button>
        </div>
      </div>
      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Loading documents…</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No documents yet. Use Create New above to start a collaborative canvas.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onOpen(r.id)}
              className="group overflow-hidden rounded-2xl bg-surface-container-lowest text-left shadow-card transition-all duration-300 hover:shadow-cardHover dark:bg-surface-container"
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
              <div className="flex items-start justify-between p-4">
                <div className="min-w-0 pr-2">
                  <h4 className="truncate text-sm font-bold text-on-surface">{r.title}</h4>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-outline">
                    {formatDocumentEditedLabel(r.updatedAt, nowMs)}
                  </p>
                </div>
                <span className="shrink-0 text-outline group-hover:text-on-surface" aria-hidden>
                  <Icon name="open_in_new" className="text-lg" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
