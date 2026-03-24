const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'

type ApiErrorBody = {
  error?: string
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    return body.error ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export type SessionUser = {
  id: string
  email: string
  displayName: string
}

export async function register(input: {
  email: string
  password: string
  displayName?: string
}) {
  return apiRequest<{ user: SessionUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function login(input: { email: string; password: string }) {
  return apiRequest<{ user: SessionUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function logout() {
  return apiRequest<void>('/auth/logout', { method: 'POST' })
}

export async function me() {
  return apiRequest<{ user: SessionUser }>('/auth/me', { method: 'GET' })
}

export type WireDocument = {
  id: string
  title: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export async function listDocuments() {
  return apiRequest<{ documents: WireDocument[] }>('/documents', {
    method: 'GET',
  })
}

export async function createDocument(input?: { title?: string }) {
  return apiRequest<{ document: WireDocument }>('/documents', {
    method: 'POST',
    body: JSON.stringify(input ?? {}),
  })
}

export async function getDocument(id: string) {
  return apiRequest<{ document: WireDocument }>(
    `/documents/${encodeURIComponent(id)}`,
    { method: 'GET' },
  )
}

export async function patchDocument(id: string, body: { title: string }) {
  return apiRequest<{ document: WireDocument }>(
    `/documents/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
}

export { API_BASE_URL }
