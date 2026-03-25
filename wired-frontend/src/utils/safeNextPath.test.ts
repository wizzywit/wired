import { safeNextPath } from './safeNextPath';

describe('postAuthNavigatePath', () => {
  it('delegates to safe next handling', () => {
    expect(safeNextPath(null)).toBe('/dashboard');
    expect(safeNextPath('/canvas')).toBe('/canvas');
    expect(safeNextPath('//evil')).toBe('/dashboard');
  });
});
