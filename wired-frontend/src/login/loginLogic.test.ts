import { parseLoginFormFields } from './loginLogic';

describe('parseLoginFormFields', () => {
  it('reads email and password', () => {
    const fd = new FormData();
    fd.set('email', '  a@b.co  ');
    fd.set('password', 'secret');
    expect(parseLoginFormFields(fd)).toEqual({ email: 'a@b.co', password: 'secret' });
  });

  it('handles missing fields', () => {
    expect(parseLoginFormFields(new FormData())).toEqual({ email: '', password: '' });
  });
});
