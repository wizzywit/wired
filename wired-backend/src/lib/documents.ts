import { randomUUID } from "node:crypto";
import { redis } from "./redis.js";

export type StoredDocument = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

const docKey = (id: string) => `wired:doc:${id}`;
const userDocsKey = (userId: string) => `wired:user:${userId}:documents`;
const roomYjsKey = (roomId: string) => `wired:rooms:${roomId}:yjs`;
const roomLegacyStateKey = (roomId: string) => `wired:rooms:${roomId}:state`;

export async function createDocument(ownerId: string, title?: string): Promise<StoredDocument> {
  const id = randomUUID();
  const now = new Date().toISOString();
  const doc: StoredDocument = {
    id,
    title: title?.trim() || "Untitled document",
    ownerId,
    createdAt: now,
    updatedAt: now
  };
  await redis.set(docKey(id), JSON.stringify(doc));
  await redis.zAdd(userDocsKey(ownerId), { score: Date.now(), value: id });
  return doc;
}

export async function getDocumentById(id: string): Promise<StoredDocument | null> {
  const raw = await redis.get(docKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredDocument;
  } catch {
    return null;
  }
}

export async function documentExists(id: string): Promise<boolean> {
  return (await redis.exists(docKey(id))) === 1;
}

export async function listDocumentsForUser(userId: string): Promise<StoredDocument[]> {
  const ids = await redis.zRange(userDocsKey(userId), 0, -1, { REV: true });
  if (ids.length === 0) return [];
  const results = await Promise.all(ids.map((docId) => redis.get(docKey(docId))));
  const out: StoredDocument[] = [];
  for (let i = 0; i < ids.length; i++) {
    const r = results[i];
    if (!r) continue;
    try {
      out.push(JSON.parse(r) as StoredDocument);
    } catch {
      // skip corrupt
    }
  }
  return out;
}

/** Called when room canvas state is persisted so “recent” order stays fresh. */
export async function bumpDocumentActivity(id: string): Promise<void> {
  const raw = await redis.get(docKey(id));
  if (!raw) return;
  let doc: StoredDocument;
  try {
    doc = JSON.parse(raw) as StoredDocument;
  } catch {
    return;
  }
  doc.updatedAt = new Date().toISOString();
  await redis.set(docKey(id), JSON.stringify(doc));
  await redis.zAdd(userDocsKey(doc.ownerId), { score: Date.now(), value: id });
}

/** Returns updated doc, or null if missing or not owned by `ownerId`. */
export async function updateDocumentForOwner(
  id: string,
  ownerId: string,
  input: { title: string }
): Promise<StoredDocument | null> {
  const raw = await redis.get(docKey(id));
  if (!raw) return null;
  let doc: StoredDocument;
  try {
    doc = JSON.parse(raw) as StoredDocument;
  } catch {
    return null;
  }
  if (doc.ownerId !== ownerId) return null;
  const nextTitle = input.title.trim().slice(0, 120) || "Untitled document";
  doc.title = nextTitle;
  doc.updatedAt = new Date().toISOString();
  await redis.set(docKey(id), JSON.stringify(doc));
  await redis.zAdd(userDocsKey(doc.ownerId), { score: Date.now(), value: id });
  return doc;
}

/** Deletes owned document and related persisted room state. */
export async function deleteDocumentForOwner(id: string, ownerId: string): Promise<boolean> {
  const raw = await redis.get(docKey(id));
  if (!raw) return false;
  let doc: StoredDocument;
  try {
    doc = JSON.parse(raw) as StoredDocument;
  } catch {
    return false;
  }
  if (doc.ownerId !== ownerId) return false;

  await Promise.all([
    redis.del(docKey(id)),
    redis.zRem(userDocsKey(ownerId), id),
    redis.del(roomYjsKey(id)),
    redis.del(roomLegacyStateKey(id))
  ]);
  return true;
}
