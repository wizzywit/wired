import { apiRequest } from '../service';
import type { SessionUser } from '../domain-types';

export async function login(input: { email: string; password: string }) {
  return apiRequest<{ user: SessionUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
