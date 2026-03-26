import { randomUUID } from "node:crypto";
import { redis } from "./redis.js";
import { getUserByEmail, getUserById } from "./users.js";

export type StoredDocument = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentRole = "owner" | "editor" | "viewer";
export type LinkAccess = "none" | "viewer" | "editor";

export type ShareUser = {
  userId: string;
  email: string;
  displayName: string;
  role: DocumentRole;
};

const docKey = (id: string) => `wired:doc:${id}`;
const userDocsKey = (userId: string) => `wired:user:${userId}:documents`;
const userSharedDocsKey = (userId: string) => `wired:user:${userId}:shared-documents`;
const roomYjsKey = (roomId: string) => `wired:rooms:${roomId}:yjs`;
const roomLegacyStateKey = (roomId: string) => `wired:rooms:${roomId}:state`;
const docAclKey = (id: string) => `wired:doc:${id}:acl`;
const docInvitesKey = (id: string) => `wired:doc:${id}:invites`;
const docShareKey = (id: string) => `wired:doc:${id}:share`;

function normalizeRole(raw: string | null | undefined): DocumentRole | null {
  if (raw === "owner" || raw === "editor" || raw === "viewer") return raw;
  return null;
}

function normalizeLinkAccess(raw: string | null | undefined): LinkAccess {
  if (raw === "viewer" || raw === "editor") return raw;
  return "none";
}

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

export async function getLinkAccessForDocument(id: string): Promise<LinkAccess> {
  const raw = await redis.hGet(docShareKey(id), "linkAccess");
  return normalizeLinkAccess(raw);
}

export async function setLinkAccessForOwner(
  id: string,
  ownerId: string,
  access: LinkAccess
): Promise<boolean> {
  const doc = await getDocumentById(id);
  if (!doc || doc.ownerId !== ownerId) return false;
  await redis.hSet(docShareKey(id), "linkAccess", access);
  return true;
}

export async function resolveExplicitRoleForUser(
  id: string,
  userId: string
): Promise<DocumentRole | null> {
  const doc = await getDocumentById(id);
  if (!doc) return null;
  if (doc.ownerId === userId) return "owner";
  return normalizeRole(await redis.hGet(docAclKey(id), userId));
}

export async function resolveAccessRoleForUser(
  id: string,
  userId: string
): Promise<Exclude<DocumentRole, "owner"> | "owner" | null> {
  const explicit = await resolveExplicitRoleForUser(id, userId);
  if (explicit) return explicit;
  const linkAccess = await getLinkAccessForDocument(id);
  if (linkAccess === "none") return null;
  return linkAccess;
}

export async function canUserAccessDocument(id: string, userId: string): Promise<boolean> {
  return (await resolveAccessRoleForUser(id, userId)) !== null;
}

export async function canUserEditDocument(id: string, userId: string): Promise<boolean> {
  const role = await resolveAccessRoleForUser(id, userId);
  return role === "owner" || role === "editor";
}

export async function canUserShareDocument(id: string, userId: string): Promise<boolean> {
  const explicit = await resolveExplicitRoleForUser(id, userId);
  return explicit === "owner" || explicit === "editor";
}

export async function listDocumentsForUser(userId: string): Promise<StoredDocument[]> {
  const [ownedIds, sharedIds] = await Promise.all([
    redis.zRange(userDocsKey(userId), 0, -1, { REV: true }),
    redis.zRange(userSharedDocsKey(userId), 0, -1, { REV: true })
  ]);
  const ids = [...new Set([...ownedIds, ...sharedIds])];
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
  const now = Date.now();
  await redis.zAdd(userDocsKey(doc.ownerId), { score: now, value: id });
  const aclUserIds = await redis.hKeys(docAclKey(id));
  if (aclUserIds.length > 0) {
    await Promise.all(
      aclUserIds.map((userId) => redis.zAdd(userSharedDocsKey(userId), { score: now, value: id }))
    );
  }
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

export async function inviteOrGrantDocumentAccess(
  id: string,
  actorUserId: string,
  email: string,
  role: Exclude<DocumentRole, "owner">
): Promise<{ grantedToUserId?: string; invitedEmail?: string } | null> {
  const canShare = await canUserShareDocument(id, actorUserId);
  if (!canShare) return null;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const existingUser = await getUserByEmail(normalizedEmail);
  const now = Date.now();
  if (existingUser) {
    const doc = await getDocumentById(id);
    if (!doc) return null;
    if (existingUser.id === doc.ownerId) {
      return { grantedToUserId: existingUser.id };
    }
    await Promise.all([
      redis.hSet(docAclKey(id), existingUser.id, role),
      redis.hDel(docInvitesKey(id), normalizedEmail),
      redis.zAdd(userSharedDocsKey(existingUser.id), { score: now, value: id })
    ]);
    return { grantedToUserId: existingUser.id };
  }

  await redis.hSet(docInvitesKey(id), normalizedEmail, role);
  return { invitedEmail: normalizedEmail };
}

export async function listDocumentShareUsers(id: string): Promise<ShareUser[]> {
  const doc = await getDocumentById(id);
  if (!doc) return [];
  const owner = await getUserById(doc.ownerId);
  const acl = await redis.hGetAll(docAclKey(id));

  const users: ShareUser[] = [];
  if (owner) {
    users.push({
      userId: owner.id,
      email: owner.email,
      displayName: owner.displayName,
      role: "owner"
    });
  }

  const entries = Object.entries(acl);
  for (const [userId, rawRole] of entries) {
    const role = normalizeRole(rawRole);
    if (!role || role === "owner") continue;
    const user = await getUserById(userId);
    if (!user) continue;
    users.push({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      role
    });
  }
  return users;
}

export async function listDocumentPendingInvites(
  id: string
): Promise<Array<{ email: string; role: Exclude<DocumentRole, "owner"> }>> {
  const invites = await redis.hGetAll(docInvitesKey(id));
  const out: Array<{ email: string; role: Exclude<DocumentRole, "owner"> }> = [];
  for (const [email, rawRole] of Object.entries(invites)) {
    if (rawRole === "editor" || rawRole === "viewer") {
      out.push({ email, role: rawRole });
    }
  }
  return out;
}

export async function removePendingInvite(
  id: string,
  actorUserId: string,
  email: string
): Promise<boolean> {
  if (!(await canUserShareDocument(id, actorUserId))) return false;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;
  await redis.hDel(docInvitesKey(id), normalizedEmail);
  return true;
}

export async function updateCollaboratorRole(
  id: string,
  actorUserId: string,
  targetUserId: string,
  role: Exclude<DocumentRole, "owner">
): Promise<boolean> {
  if (!(await canUserShareDocument(id, actorUserId))) return false;
  if (actorUserId === targetUserId) return false;
  const doc = await getDocumentById(id);
  if (!doc) return false;
  if (targetUserId === doc.ownerId) return false;
  const user = await getUserById(targetUserId);
  if (!user) return false;
  await Promise.all([
    redis.hSet(docAclKey(id), targetUserId, role),
    redis.zAdd(userSharedDocsKey(targetUserId), { score: Date.now(), value: id })
  ]);
  return true;
}

export async function removeCollaborator(
  id: string,
  actorUserId: string,
  targetUserId: string
): Promise<boolean> {
  if (!(await canUserShareDocument(id, actorUserId))) return false;
  if (actorUserId === targetUserId) return false;
  const doc = await getDocumentById(id);
  if (!doc) return false;
  if (targetUserId === doc.ownerId) return false;
  await Promise.all([
    redis.hDel(docAclKey(id), targetUserId),
    redis.zRem(userSharedDocsKey(targetUserId), id)
  ]);
  return true;
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

  const aclUserIds = await redis.hKeys(docAclKey(id));
  await Promise.all([
    redis.del(docKey(id)),
    redis.zRem(userDocsKey(ownerId), id),
    redis.del(docAclKey(id)),
    redis.del(docInvitesKey(id)),
    redis.del(docShareKey(id)),
    redis.del(roomYjsKey(id)),
    redis.del(roomLegacyStateKey(id))
  ]);
  if (aclUserIds.length > 0) {
    await Promise.all(aclUserIds.map((userId) => redis.zRem(userSharedDocsKey(userId), id)));
  }
  return true;
}
