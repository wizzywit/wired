import { apiRequest } from '../service';
import type { WireDocument } from '../domain-types';

export async function getDocument(id: string) {
  return apiRequest<{ document: WireDocument }>(`/documents/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function patchDocument(id: string, body: { title: string }) {
  return apiRequest<{ document: WireDocument }>(`/documents/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
