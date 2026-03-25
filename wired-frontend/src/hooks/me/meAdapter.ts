import { apiRequest } from '../../service';
import type { SessionUser } from '../../domain-types';

export async function me() {
  return apiRequest<{ user: SessionUser }>('/auth/me', { method: 'GET' });
}
