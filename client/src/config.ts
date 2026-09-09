export interface ClientConfig {
  serverUrl: string;
}

const developmentServerUrl = `${window.location.protocol}//${window.location.hostname}:3001`;

export const clientConfig: ClientConfig = {
  serverUrl: import.meta.env.VITE_GAME_SERVER_URL || import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? developmentServerUrl : window.location.origin)
};
