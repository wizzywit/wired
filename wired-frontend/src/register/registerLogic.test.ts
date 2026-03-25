import { parseRegisterFormFields } from './registerLogic';

describe('parseRegisterFormFields', () => {
  it('trims and omits empty display name', () => {
    const fd = new FormData();
    fd.set('full_name', '   ');
    fd.set('email', 'x@y.z');
    fd.set('password', 'p');
    expect(parseRegisterFormFields(fd)).toEqual({
      email: 'x@y.z',
      password: 'p',
      displayName: undefined,
    });
  });

  it('includes display name when non-empty', () => {
    const fd = new FormData();
    fd.set('full_name', ' Ada ');
    fd.set('email', 'a@b.c');
    fd.set('password', 'pw');
    expect(parseRegisterFormFields(fd)).toEqual({
      email: 'a@b.c',
      password: 'pw',
      displayName: 'Ada',
    });
  });
});
