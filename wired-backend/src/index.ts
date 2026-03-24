import http from "node:http";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectRedis } from "./lib/redis.js";
import { sessionMiddleware } from "./lib/session.js";
import { authRouter } from "./routes/auth.js";
import { documentsRouter } from "./routes/documents.js";
import { buildCollaborationServer } from "./socket/collaboration.js";

async function bootstrap() {
  await connectRedis();

  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(sessionMiddleware);

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use("/auth", authRouter);
  app.use("/documents", documentsRouter);

  const server = http.createServer(app);
  buildCollaborationServer(server, sessionMiddleware);

  server.listen(env.PORT, () => {
    console.log(`wired-backend listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap wired-backend:", error);
  process.exit(1);
});
