import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootEnvPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env");
if (existsSync(rootEnvPath)) loadEnvFile(rootEnvPath);

export interface ServerConfig {
  port: number;
  allowedOrigins: string[] | true;
  logLevel: "debug" | "info" | "warn" | "error";
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("SERVER_PORT/PORT must be a valid port");
  return port;
}

function parseOrigins(value: string | undefined): string[] | true {
  if (!value || value === "*") return true;
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}

export const serverConfig: ServerConfig = {
  port: parsePort(process.env.SERVER_PORT ?? process.env.PORT),
  allowedOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
  logLevel: (process.env.LOG_LEVEL as ServerConfig["logLevel"] | undefined) ?? "info"
};
