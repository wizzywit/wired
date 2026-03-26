import { redis } from "./redis.js";

export type StoredUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
};

const USERS_BY_EMAIL_KEY = "wired:users:by-email";
const USERS_BY_ID_KEY = "wired:users:by-id";

export async function saveUser(user: StoredUser): Promise<void> {
  await Promise.all([
    redis.hSet(USERS_BY_EMAIL_KEY, user.email, JSON.stringify(user)),
    redis.hSet(USERS_BY_ID_KEY, user.id, JSON.stringify(user))
  ]);
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const raw = await redis.hGet(USERS_BY_EMAIL_KEY, email.trim().toLowerCase());
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  const raw = await redis.hGet(USERS_BY_ID_KEY, id);
  if (!raw) {
    // Backward compatibility for users created before `USERS_BY_ID_KEY` was introduced.
    const all = await redis.hGetAll(USERS_BY_EMAIL_KEY);
    for (const value of Object.values(all)) {
      try {
        const parsed = JSON.parse(value) as StoredUser;
        if (parsed.id === id) {
          await redis.hSet(USERS_BY_ID_KEY, parsed.id, JSON.stringify(parsed));
          return parsed;
        }
      } catch {
        // skip corrupt entries
      }
    }
    return null;
  }
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
