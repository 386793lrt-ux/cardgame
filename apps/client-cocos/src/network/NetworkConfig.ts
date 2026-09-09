export type ClientEnvironment = "development" | "production";

export interface NetworkConfigInput {
  environment: ClientEnvironment;
  developmentServerUrl: string;
  productionServerUrl: string;
}

export function resolveGameServerUrl(config: NetworkConfigInput): string {
  const url = config.environment === "production" ? config.productionServerUrl : config.developmentServerUrl;
  if (!/^https?:\/\//.test(url)) throw new Error("Game server URL must use http:// or https://");
  if (config.environment === "production" && !url.startsWith("https://")) {
    throw new Error("Production game server URL must use HTTPS/WSS");
  }
  return url.replace(/\/$/, "");
}
