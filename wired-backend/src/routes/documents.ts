import { Router } from "express";
import { z } from "zod";
import {
  type DocumentRole,
  canUserAccessDocument,
  canUserEditDocument,
  canUserShareDocument,
  createDocument,
  deleteDocumentForOwner,
  getDocumentById,
  getLinkAccessForDocument,
  inviteOrGrantDocumentAccess,
  listDocumentPendingInvites,
  listDocumentShareUsers,
  listDocumentsForUser,
  removePendingInvite,
  removeCollaborator,
  resolveAccessRoleForUser,
  setLinkAccessForOwner,
  type LinkAccess,
  updateDocumentForOwner,
  updateCollaboratorRole,
  type StoredDocument
} from "../lib/documents.js";
import { getCollaborationIo } from "../socket/runtime.js";
import { persistInitialRoomYjsFromBase64 } from "../lib/yjsRooms.js";

export const documentsRouter = Router();

function publicDoc(doc: StoredDocument) {
  return {
    id: doc.id,
    title: doc.title,
    ownerId: doc.ownerId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

async function publicDocForUser(doc: StoredDocument, userId: string) {
  const [role, canEdit, canShare] = await Promise.all([
    resolveAccessRoleForUser(doc.id, userId),
    canUserEditDocument(doc.id, userId),
    canUserShareDocument(doc.id, userId)
  ]);

  return {
    ...publicDoc(doc),
    role: (role ?? "viewer") as DocumentRole,
    canEdit,
    canShare,
    canDelete: doc.ownerId === userId
  };
}

documentsRouter.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const user = req.session.user;
  const list = await listDocumentsForUser(user.id);
  const docs = await Promise.all(list.map((doc) => publicDocForUser(doc, user.id)));
  return res.status(200).json({ documents: docs });
});

const createSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  /** Full Yjs document state (base64) so the room is seeded before the canvas loads */
  initialYjsBase64: z.string().max(900_000).optional()
});

const patchSchema = z.object({
  title: z.string().min(1).max(120)
});

documentsRouter.post("/", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const payload = createSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid payload." });
  }
  const doc = await createDocument(req.session.user.id, payload.data.title);
  if (payload.data.initialYjsBase64?.trim()) {
    const seeded = await persistInitialRoomYjsFromBase64(doc.id, payload.data.initialYjsBase64.trim());
    if (!seeded.ok) {
      await deleteDocumentForOwner(doc.id, req.session.user.id);
      return res.status(400).json({ error: seeded.error });
    }
  }
  return res.status(201).json({ document: publicDoc(doc) });
});

documentsRouter.get("/:id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  if (!id) {
    return res.status(400).json({ error: "Missing document id." });
  }
  const doc = await getDocumentById(id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found." });
  }
  const canAccess = await canUserAccessDocument(id, req.session.user.id);
  if (!canAccess) {
    return res.status(403).json({ error: "You do not have access to this document." });
  }
  return res.status(200).json({ document: await publicDocForUser(doc, req.session.user.id) });
});

documentsRouter.patch("/:id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  if (!id) {
    return res.status(400).json({ error: "Missing document id." });
  }
  const payload = patchSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid payload." });
  }
  const existing = await getDocumentById(id);
  if (!existing) {
    return res.status(404).json({ error: "Document not found." });
  }
  const canEdit = await canUserEditDocument(id, req.session.user.id);
  if (!canEdit) {
    return res.status(403).json({ error: "You do not have edit rights for this document." });
  }
  const updated = await updateDocumentForOwner(id, existing.ownerId, {
    title: payload.data.title
  });
  if (!updated) {
    return res.status(404).json({ error: "Document not found." });
  }
  return res.status(200).json({ document: publicDoc(updated) });
});

documentsRouter.delete("/:id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  if (!id) {
    return res.status(400).json({ error: "Missing document id." });
  }
  const deleted = await deleteDocumentForOwner(id, req.session.user.id);
  if (!deleted) {
    const existing = await getDocumentById(id);
    if (existing && existing.ownerId !== req.session.user.id) {
      return res.status(403).json({ error: "You can only delete documents you own." });
    }
    return res.status(404).json({ error: "Document not found." });
  }
  getCollaborationIo()?.to(id).emit("room:deleted", { roomId: id });
  return res.status(204).send();
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "viewer"])
});

const rolePatchSchema = z.object({
  role: z.enum(["editor", "viewer"])
});

const linkPatchSchema = z.object({
  access: z.enum(["none", "viewer", "editor"])
});

const inviteDeleteSchema = z.object({
  email: z.string().email()
});

documentsRouter.get("/:id/share", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  if (!id) {
    return res.status(400).json({ error: "Missing document id." });
  }
  const doc = await getDocumentById(id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found." });
  }
  const canAccess = await canUserAccessDocument(id, req.session.user.id);
  if (!canAccess) {
    return res.status(403).json({ error: "You do not have access to this document." });
  }

  const [users, invites, linkAccess, meRole, canShare] = await Promise.all([
    listDocumentShareUsers(id),
    listDocumentPendingInvites(id),
    getLinkAccessForDocument(id),
    resolveAccessRoleForUser(id, req.session.user.id),
    canUserShareDocument(id, req.session.user.id)
  ]);

  return res.status(200).json({
    share: {
      documentId: id,
      documentTitle: doc.title,
      meUserId: req.session.user.id,
      meRole: meRole ?? "viewer",
      canShare,
      linkAccess,
      users,
      invites
    }
  });
});

documentsRouter.post("/:id/share/invite", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  if (!id) {
    return res.status(400).json({ error: "Missing document id." });
  }
  const payload = inviteSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid payload." });
  }
  const result = await inviteOrGrantDocumentAccess(
    id,
    req.session.user.id,
    payload.data.email,
    payload.data.role
  );
  if (!result) {
    return res.status(403).json({ error: "You do not have share rights for this document." });
  }
  return res.status(200).json({ ok: true, ...result });
});

documentsRouter.patch("/:id/share/users/:userId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  const userId = req.params.userId?.trim();
  if (!id || !userId) {
    return res.status(400).json({ error: "Missing ids." });
  }
  const payload = rolePatchSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid payload." });
  }
  const ok = await updateCollaboratorRole(id, req.session.user.id, userId, payload.data.role);
  if (!ok) {
    return res.status(403).json({ error: "Unable to change this collaborator role." });
  }
  return res.status(200).json({ ok: true });
});

documentsRouter.delete("/:id/share/users/:userId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  const userId = req.params.userId?.trim();
  if (!id || !userId) {
    return res.status(400).json({ error: "Missing ids." });
  }
  const ok = await removeCollaborator(id, req.session.user.id, userId);
  if (!ok) {
    return res.status(403).json({ error: "Unable to remove this collaborator." });
  }
  return res.status(204).send();
});

documentsRouter.patch("/:id/share/link-access", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  if (!id) {
    return res.status(400).json({ error: "Missing document id." });
  }
  const payload = linkPatchSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid payload." });
  }
  const canShare = await canUserShareDocument(id, req.session.user.id);
  if (!canShare) {
    return res.status(403).json({ error: "You do not have share rights for this document." });
  }
  const doc = await getDocumentById(id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found." });
  }
  const ok = await setLinkAccessForOwner(id, doc.ownerId, payload.data.access as LinkAccess);
  if (!ok) {
    return res.status(403).json({ error: "Unable to update link access." });
  }
  return res.status(200).json({ ok: true });
});

documentsRouter.delete("/:id/share/invites", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const id = req.params.id?.trim();
  if (!id) {
    return res.status(400).json({ error: "Missing document id." });
  }
  const payload = inviteDeleteSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid payload." });
  }
  const ok = await removePendingInvite(id, req.session.user.id, payload.data.email);
  if (!ok) {
    return res.status(403).json({ error: "Unable to revoke this invite." });
  }
  return res.status(204).send();
});
