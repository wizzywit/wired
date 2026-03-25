import { apiRequest } from '../service';
import type { SessionUser } from '../domain-types';

export async function register(input: { email: string; password: string; displayName?: string }) {
  return apiRequest<{ user: SessionUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
