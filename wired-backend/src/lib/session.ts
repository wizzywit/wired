import session from "express-session";
import { RedisStore } from "connect-redis";
import { env } from "../config/env.js";
import { redis } from "./redis.js";

export const sessionMiddleware = session({
  store: new RedisStore({
    client: redis
  }),
  secret: env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: env.SESSION_TTL_SECONDS * 1000
  }
});
