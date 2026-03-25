/** Encoded `next` param for post-login return to dashboard (`/dashboard`). */
export const DASHBOARD_LOGIN_NEXT_ENCODED = encodeURIComponent('/dashboard');

export type DashboardViewState = 'loading' | 'ready';

export function resolveDashboardViewState(input: {
  mePending: boolean;
  meError: boolean;
  hasUser: boolean;
}): DashboardViewState {
  const { mePending, meError, hasUser } = input;
  if (mePending || meError || !hasUser) return 'loading';
  return 'ready';
}

/** Path + query for opening a document on the canvas (for `navigate`). */
export function buildCanvasPathForDocumentId(documentId: string): string {
  return `/canvas?document=${encodeURIComponent(documentId)}`;
}

/**
 * Relative-time label for a document’s `updatedAt` ISO string.
 * Pass `nowMs` for deterministic tests.
 */
export function formatDocumentEditedLabel(iso: string, nowMs: number): string {
  const d = new Date(iso);
  const diff = nowMs - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Edited just now';
  if (mins < 60) return `Edited ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `Edited ${hrs}h ago`;
  return `Edited ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
