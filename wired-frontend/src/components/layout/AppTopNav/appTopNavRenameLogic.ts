export type RenameCommitDecision =
  | { type: 'noop' }
  | { type: 'cancel' }
  | { type: 'close' }
  | { type: 'submit'; nextTitle: string };

type RenameCommitDecisionInput = {
  canRename: boolean;
  isSaving: boolean;
  draft: string;
  currentTitle?: string;
};

export function decideRenameCommit(input: RenameCommitDecisionInput): RenameCommitDecision {
  const { canRename, isSaving, draft, currentTitle } = input;
  if (!canRename || isSaving) {
    return { type: 'noop' };
  }

  const trimmedDraft = draft.trim();
  if (trimmedDraft === '') {
    return { type: 'cancel' };
  }

  if (trimmedDraft === currentTitle) {
    return { type: 'close' };
  }

  return { type: 'submit', nextTitle: trimmedDraft };
}

export function isRenameActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}
