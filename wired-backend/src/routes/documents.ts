import { Router } from "express";
import { z } from "zod";
import {
  createDocument,
  deleteDocumentForOwner,
  getDocumentById,
  listDocumentsForUser,
  updateDocumentForOwner,
  type StoredDocument
} from "../lib/documents.js";
import { getCollaborationIo } from "../socket/runtime.js";

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

documentsRouter.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const list = await listDocumentsForUser(req.session.user.id);
  return res.status(200).json({ documents: list.map(publicDoc) });
});

const createSchema = z.object({
  title: z.string().min(1).max(120).optional()
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
  return res.status(200).json({ document: publicDoc(doc) });
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
  const updated = await updateDocumentForOwner(id, req.session.user.id, {
    title: payload.data.title
  });
  if (!updated) {
    const existing = await getDocumentById(id);
    if (existing && existing.ownerId !== req.session.user.id) {
      return res.status(403).json({ error: "You can only rename documents you own." });
    }
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
