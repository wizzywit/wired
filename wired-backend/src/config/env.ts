import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  SESSION_SECRET: z.string().min(8),
  REDIS_URL: z.string().url(),
  SESSION_TTL_SECONDS: z.coerce.number().default(60 * 60 * 24 * 7),
  ROOM_STATE_TTL_SECONDS: z.coerce.number().default(60 * 60 * 24 * 7)
});

export const env = envSchema.parse(process.env);
