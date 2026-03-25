import { apiRequest } from '../../../service';

export async function logout() {
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}
