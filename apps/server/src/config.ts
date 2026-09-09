import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { resolve } from "node:path";

const moduleDirectory = import.meta.dirname ?? process.cwd();
const rootEnvPath = resolve(moduleDirectory, "../../../.env");
if (existsSync(rootEnvPath)) loadEnvFile(rootEnvPath);

export interface ServerConfig {
  environment: "development" | "production" | "test";
  host: string;
  port: number;
  allowedOrigins: string[];
  logLevel: "debug" | "info" | "warn" | "error";
  reconnectGracePeriodMs: number;
  waitingRoomTtlMs: number;
  finishedRoomTtlMs: number;
  cleanupIntervalMs: number;
  rateLimitWindowMs: number;
  createRoomRateLimit: number;
  joinRoomRateLimit: number;
  actionRateLimit: number;
}

function integer(name: string, value: string | undefined, fallback: number, minimum = 1): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < minimum) throw new Error(`${name} must be an integer >= ${minimum}`);
  return parsed;
}

function parseOrigins(value: string | undefined, environment: ServerConfig["environment"]): string[] {
  const origins = (value ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
  if (origins.includes("*")) throw new Error("ALLOWED_ORIGINS cannot contain '*'");
  if (origins.length === 0 && environment === "production") throw new Error("ALLOWED_ORIGINS is required in production");
  return origins.length > 0 ? origins : ["http://localhost:5173", "http://127.0.0.1:5173"];
}

const environment = (process.env.NODE_ENV ?? "development") as ServerConfig["environment"];
if (!["development", "production", "test"].includes(environment)) throw new Error("NODE_ENV must be development, production, or test");

export const serverConfig: ServerConfig = {
  environment,
  host: process.env.HOST ?? "0.0.0.0",
  port: integer("PORT", process.env.PORT ?? process.env.SERVER_PORT, 3001),
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS ?? process.env.CLIENT_ORIGIN, environment),
  logLevel: (process.env.LOG_LEVEL as ServerConfig["logLevel"] | undefined) ?? "info",
  reconnectGracePeriodMs: integer("RECONNECT_GRACE_PERIOD_MS", process.env.RECONNECT_GRACE_PERIOD_MS, 60_000),
  waitingRoomTtlMs: integer("WAITING_ROOM_TTL_MS", process.env.WAITING_ROOM_TTL_MS, 10 * 60_000),
  finishedRoomTtlMs: integer("FINISHED_ROOM_TTL_MS", process.env.FINISHED_ROOM_TTL_MS, 5 * 60_000),
  cleanupIntervalMs: integer("ROOM_CLEANUP_INTERVAL_MS", process.env.ROOM_CLEANUP_INTERVAL_MS, 10_000),
  rateLimitWindowMs: integer("RATE_LIMIT_WINDOW_MS", process.env.RATE_LIMIT_WINDOW_MS, 10_000),
  createRoomRateLimit: integer("CREATE_ROOM_RATE_LIMIT", process.env.CREATE_ROOM_RATE_LIMIT, 5),
  joinRoomRateLimit: integer("JOIN_ROOM_RATE_LIMIT", process.env.JOIN_ROOM_RATE_LIMIT, 20),
  actionRateLimit: integer("ACTION_RATE_LIMIT", process.env.ACTION_RATE_LIMIT, 80)
};
