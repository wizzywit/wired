import { describe, expect, it } from 'vitest';
import { decideRenameCommit, isRenameActivationKey } from './appTopNavRenameLogic';

describe('decideRenameCommit', () => {
  it('returns noop when renaming is unavailable', () => {
    const decision = decideRenameCommit({
      canRename: false,
      isSaving: false,
      draft: 'New title',
      currentTitle: 'Old title',
    });
    expect(decision).toEqual({ type: 'noop' });
  });

  it('returns noop when a save operation is already in progress', () => {
    const decision = decideRenameCommit({
      canRename: true,
      isSaving: true,
      draft: 'New title',
      currentTitle: 'Old title',
    });
    expect(decision).toEqual({ type: 'noop' });
  });

  it('returns cancel for an empty trimmed draft', () => {
    const decision = decideRenameCommit({
      canRename: true,
      isSaving: false,
      draft: '   ',
      currentTitle: 'Old title',
    });
    expect(decision).toEqual({ type: 'cancel' });
  });

  it('returns close when draft equals current title after trim', () => {
    const decision = decideRenameCommit({
      canRename: true,
      isSaving: false,
      draft: '  Old title  ',
      currentTitle: 'Old title',
    });
    expect(decision).toEqual({ type: 'close' });
  });

  it('returns submit with normalized title when draft is valid and changed', () => {
    const decision = decideRenameCommit({
      canRename: true,
      isSaving: false,
      draft: '  New title  ',
      currentTitle: 'Old title',
    });
    expect(decision).toEqual({ type: 'submit', nextTitle: 'New title' });
  });
});

describe('isRenameActivationKey', () => {
  it('accepts Enter and Space keys', () => {
    expect(isRenameActivationKey('Enter')).toBe(true);
    expect(isRenameActivationKey(' ')).toBe(true);
  });

  it('rejects non-activation keys', () => {
    expect(isRenameActivationKey('Escape')).toBe(false);
    expect(isRenameActivationKey('a')).toBe(false);
  });
});
