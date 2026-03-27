import { apiRequest } from '../service';
import type { WireDocument } from '../domain-types';

export async function listDocuments() {
  return apiRequest<{ documents: WireDocument[] }>('/documents', {
    method: 'GET',
  });
}

export async function createDocument(input?: { title?: string; initialYjsBase64?: string }) {
  return apiRequest<{ document: WireDocument }>('/documents', {
    method: 'POST',
    body: JSON.stringify(input ?? {}),
  });
}

export async function deleteDocument(documentId: string) {
  return apiRequest<void>(`/documents/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
  });
}
