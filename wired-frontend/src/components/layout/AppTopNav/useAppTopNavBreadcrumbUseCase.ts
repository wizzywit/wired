import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { decideRenameCommit, isRenameActivationKey } from './appTopNavRenameLogic';

type UseAppTopNavBreadcrumbUseCaseInput = {
  breadcrumb?: string;
  onRenameBreadcrumb?: (nextTitle: string) => Promise<void> | void;
};

export function useAppTopNavBreadcrumbUseCase({ breadcrumb, onRenameBreadcrumb }: UseAppTopNavBreadcrumbUseCaseInput) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(breadcrumb ?? '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(breadcrumb ?? '');
    }
  }, [breadcrumb, editing]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft(breadcrumb ?? '');
  }, [breadcrumb]);

  const startEdit = useCallback(() => {
    if (!onRenameBreadcrumb) return;
    setEditing(true);
    setDraft(breadcrumb ?? '');
  }, [breadcrumb, onRenameBreadcrumb]);

  const commitEdit = useCallback(async () => {
    const decision = decideRenameCommit({
      canRename: Boolean(onRenameBreadcrumb),
      isSaving: saving,
      draft,
      currentTitle: breadcrumb,
    });

    if (decision.type === 'noop') return;
    if (decision.type === 'cancel') {
      cancelEdit();
      return;
    }
    if (decision.type === 'close') {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onRenameBreadcrumb?.(decision.nextTitle);
      setEditing(false);
    } catch {
      setDraft(breadcrumb ?? '');
    } finally {
      setSaving(false);
    }
  }, [breadcrumb, cancelEdit, draft, onRenameBreadcrumb, saving]);

  const onInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void commitEdit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    },
    [cancelEdit, commitEdit]
  );

  const onDisplayKeyDown = useCallback(
    (e: KeyboardEvent<HTMLSpanElement>) => {
      if (!isRenameActivationKey(e.key)) return;
      e.preventDefault();
      startEdit();
    },
    [startEdit]
  );

  return {
    editing,
    draft,
    saving,
    inputRef,
    setDraft,
    startEdit,
    commitEdit,
    onInputKeyDown,
    onDisplayKeyDown,
  };
}
