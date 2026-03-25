import { getErrorMessage } from './getErrorMessage';

describe('authErrorMessage', () => {
  it('returns message for Error', () => {
    expect(getErrorMessage(new Error('bad'), 'fallback')).toBe('bad');
  });

  it('returns fallback for non-Error', () => {
    expect(getErrorMessage('x', 'fallback')).toBe('fallback');
  });
});
