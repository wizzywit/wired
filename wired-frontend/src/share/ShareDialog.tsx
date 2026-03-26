import { useEffect } from 'react';
import { Icon } from '../components/common/Icon';
import { SelectMenu } from '../components/common/SelectMenu';
import { useShareDialogUseCase } from './useShareDialogUseCase';

function initialsFromNameOrEmail(name: string, email: string): string {
  const cleaned = name.trim();
  if (cleaned) {
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function ShareDialog({
  open,
  onClose,
  documentId,
  documentTitle,
}: {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}) {
  const shareState = useShareDialogUseCase({
    documentId,
    documentTitle,
    open,
  });
  const {
    resetDialogTransientState,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    submitInvite,
    changeUserRole,
    removeUser,
    changeLinkAccess,
    copyShareUrl,
    copySuccess,
    shareUrl,
    canShare,
    isBusy,
    isLoading,
    toast,
    clearToast,
    share,
    fallbackTitle,
    revokeInvite,
  } = shareState;

  useEffect(() => {
    if (!open) {
      resetDialogTransientState();
    }
  }, [open, resetDialogTransientState]);

  if (!open) return null;

  const title = share?.documentTitle ?? fallbackTitle;
  const linkAccess = share?.linkAccess ?? 'none';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-on-background/10 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-visible rounded-3xl border border-outline-variant/20 bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.12)] dark:bg-slate-900 dark:shadow-black/40">
        {toast ? (
          <div className="px-8 pt-5">
            <div
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                toast.tone === 'success'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}
            >
              <span>{toast.message}</span>
              <button
                type="button"
                className="ml-3 rounded p-0.5 opacity-80 hover:opacity-100"
                onClick={clearToast}
                aria-label="Dismiss notice"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
          </div>
        ) : null}
        <div className="flex items-start justify-between px-8 pb-6 pt-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Share & Collaborate</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Project: &quot;{title}&quot;</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="px-8 pb-6">
          <div className="flex gap-2">
            <input
              className="h-12 flex-grow rounded-xl border-none bg-surface-container-high px-4 text-sm outline-none transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10"
              placeholder="Enter email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={!canShare || isBusy}
            />
            <SelectMenu
              value={inviteRole}
              onChange={setInviteRole}
              disabled={!canShare || isBusy}
              className="h-12 min-w-[7.25rem]"
              options={[
                { value: 'viewer', label: 'Viewer' },
                { value: 'editor', label: 'Editor' },
              ]}
            />
            <button
              type="button"
              onClick={() => void submitInvite()}
              disabled={!canShare || isBusy || inviteEmail.trim() === ''}
              className="action-gradient h-12 whitespace-nowrap rounded-xl px-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              Invite
            </button>
          </div>
          {!canShare ? (
            <p className="mt-2 text-xs text-on-surface-variant">
              You have access to this document, but only owners and editors can share it.
            </p>
          ) : null}
        </div>

        <div className="h-px bg-outline-variant/15" />

        <div className="max-h-[300px] space-y-4 overflow-y-auto px-8 py-6">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
            People with access
          </h3>
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Loading sharing settings...</p>
          ) : (
            <>
              {share?.users.map((u) => {
                const isSelfInvitedCollaborator =
                  Boolean(share?.meUserId) &&
                  u.userId === share?.meUserId &&
                  share?.meRole !== 'owner';
                return (
                <div key={u.userId} className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {initialsFromNameOrEmail(u.displayName, u.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight text-on-surface">
                        {u.displayName}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">{u.email}</p>
                    </div>
                  </div>
                  {u.role === 'owner' ? (
                    <span className="px-3 text-xs font-medium text-on-surface-variant/60">Owner</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <SelectMenu
                        value={u.role}
                        onChange={(next) => void changeUserRole(u.userId, next)}
                        disabled={!canShare || isBusy || isSelfInvitedCollaborator}
                        className="h-9 min-w-[6.75rem]"
                        menuPlacement="top"
                        options={[
                          { value: 'viewer', label: 'Viewer' },
                          { value: 'editor', label: 'Editor' },
                        ]}
                      />
                      <button
                        type="button"
                        disabled={!canShare || isBusy || isSelfInvitedCollaborator}
                        onClick={() => void removeUser(u.userId)}
                        className="rounded-md p-1 text-on-surface-variant hover:text-red-600 disabled:opacity-50"
                        aria-label={`Remove ${u.displayName}`}
                      >
                        <Icon name="delete" size="sm" />
                      </button>
                    </div>
                  )}
                </div>
                );
              })}
              {share?.invites?.length ? (
                <div className="pt-2">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                    Pending invites
                  </p>
                  <div className="space-y-2">
                    {share.invites.map((invite) => (
                      <div key={invite.email} className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-on-surface-variant">{invite.email}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium uppercase text-on-surface-variant">
                            {invite.role}
                          </span>
                          {canShare ? (
                            <button
                              type="button"
                              className="rounded-md p-1 text-on-surface-variant transition-colors hover:text-red-600"
                              onClick={() => void revokeInvite(invite.email)}
                              aria-label={`Revoke invite for ${invite.email}`}
                            >
                              <Icon name="close" size="sm" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="h-px bg-outline-variant/15" />

        <div className="bg-surface-container-low/50 px-8 py-8 dark:bg-surface-container/50">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name="link" size="sm" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">General access</p>
                <p className="text-xs text-on-surface-variant">
                  Anyone with the link can{' '}
                  <span className="font-bold text-primary">
                    {linkAccess === 'none' ? 'have no access' : linkAccess}
                  </span>
                </p>
              </div>
            </div>
            <SelectMenu
              value={linkAccess}
              onChange={(next) => void changeLinkAccess(next)}
              disabled={!canShare || isBusy}
              className="h-9 min-w-[8rem]"
              options={[
                { value: 'none', label: 'No access' },
                { value: 'viewer', label: 'Viewer' },
                { value: 'editor', label: 'Editor' },
              ]}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-grow items-center justify-between overflow-hidden rounded-xl bg-surface-container-high px-4 py-2.5">
              <span className="truncate text-xs text-on-surface-variant">{shareUrl}</span>
              <Icon name="lock" className="text-sm text-on-surface-variant/40" />
            </div>
            <button
              type="button"
              className="flex h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-surface-container-highest px-5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-high active:scale-95"
              onClick={() => void copyShareUrl()}
            >
              <Icon name="content_copy" className="text-[18px]" />
              {copySuccess ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
