import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getUserByEmail, saveUser, type StoredUser } from "../lib/users.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const payload = registerSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid registration payload." });
  }

  const email = payload.data.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "Email is already registered." });
  }

  const id = randomUUID();
  const displayName = payload.data.displayName?.trim() || email.split("@")[0];
  const passwordHash = await bcrypt.hash(payload.data.password, 12);

  const user: StoredUser = {
    id,
    email,
    displayName,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  await saveUser(user);

  req.session.user = { id: user.id, email: user.email, displayName: user.displayName };
  await new Promise<void>((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  return res.status(201).json({ user: req.session.user });
});

authRouter.post("/login", async (req, res) => {
  const payload = loginSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid login payload." });
  }

  const email = payload.data.email.trim().toLowerCase();
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const validPassword = await bcrypt.compare(payload.data.password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  req.session.user = { id: user.id, email: user.email, displayName: user.displayName };
  await new Promise<void>((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  return res.status(200).json({ user: req.session.user });
});

authRouter.post("/logout", async (req, res) => {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  res.clearCookie("connect.sid");
  return res.status(204).send();
});

authRouter.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  return res.status(200).json({ user: req.session.user });
});
