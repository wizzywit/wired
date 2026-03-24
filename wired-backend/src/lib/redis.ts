import { createClient } from "redis";
import { env } from "../config/env.js";

function formatRedisTarget(urlString: string): string {
  try {
    const u = new URL(urlString);
    const port = u.port || "6379";
    return `${u.hostname}:${port}`;
  } catch {
    return "(unparseable REDIS_URL)";
  }
}

function redactRedisUrl(urlString: string): string {
  try {
    const u = new URL(urlString);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return "(invalid REDIS_URL)";
  }
}

function logRedisFailure(error: unknown, target: string): void {
  const err = error as NodeJS.ErrnoException & { code?: string };
  console.error("\n[Redis] Connection failed.");
  console.error(`[Redis] Target: ${target}`);
  console.error(`[Redis] ${err.message || String(error)}`);
  if (err.code === "ECONNREFUSED") {
    console.error(
      "[Redis] Nothing is accepting connections there. Start Redis locally, for example: `brew services start redis` or `docker run --name redis -p 6379:6379 -d redis:7`."
    );
  } else if (err.code === "ETIMEDOUT") {
    console.error(
      "[Redis] Timed out — the host did not respond in time. Check REDIS_URL (host/port), VPN/firewall, Docker networking, and that managed Redis allows your current IP."
    );
  } else if (err.code === "ENOTFOUND") {
    console.error("[Redis] Hostname could not be resolved. Check REDIS_URL for typos.");
  }
  console.error(`[Redis] REDIS_URL (password redacted): ${redactRedisUrl(env.REDIS_URL)}`);
}

export const redis = createClient({
  url: env.REDIS_URL,
  socket: {
    connectTimeout: 15_000,
    reconnectStrategy(retries) {
      const max = 12;
      if (retries > max) {
        return new Error("Redis reconnect limit exceeded");
      }
      return Math.min(retries * 200, 3_000);
    }
  }
});

redis.on("error", (error) => {
  console.error("Redis client error:", error);
});

export async function connectRedis(): Promise<void> {
  if (redis.isOpen) return;

  const target = formatRedisTarget(env.REDIS_URL);
  try {
    await redis.connect();
    await redis.ping();
  } catch (error) {
    logRedisFailure(error, target);
    throw error;
  }
}
