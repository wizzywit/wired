import { apiRequest } from '../service';
import type { DocumentShareState, LinkAccess } from './shareTypes';

export async function getDocumentShareState(documentId: string) {
  return apiRequest<{ share: DocumentShareState }>(
    `/documents/${encodeURIComponent(documentId)}/share`,
    { method: 'GET' }
  );
}

export async function inviteDocumentCollaborator(
  documentId: string,
  body: { email: string; role: 'editor' | 'viewer' }
) {
  return apiRequest<{ ok: true }>(`/documents/${encodeURIComponent(documentId)}/share/invite`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateDocumentCollaboratorRole(
  documentId: string,
  userId: string,
  body: { role: 'editor' | 'viewer' }
) {
  return apiRequest<{ ok: true }>(
    `/documents/${encodeURIComponent(documentId)}/share/users/${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );
}

export async function removeDocumentCollaborator(documentId: string, userId: string) {
  return apiRequest<void>(
    `/documents/${encodeURIComponent(documentId)}/share/users/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
    }
  );
}

export async function updateDocumentLinkAccess(documentId: string, access: LinkAccess) {
  return apiRequest<{ ok: true }>(
    `/documents/${encodeURIComponent(documentId)}/share/link-access`,
    {
      method: 'PATCH',
      body: JSON.stringify({ access }),
    }
  );
}

export async function revokeDocumentInvite(documentId: string, email: string) {
  return apiRequest<void>(`/documents/${encodeURIComponent(documentId)}/share/invites`, {
    method: 'DELETE',
    body: JSON.stringify({ email }),
  });
}
