import { GameClient, type PlayerSession, type SessionStore } from "@riftbound/shared";
import { clientConfig } from "./config";

const storageKey = "riftbound.session.v0.3";

class BrowserSessionStore implements SessionStore {
  load(): PlayerSession | undefined {
    try {
      const value = window.localStorage.getItem(storageKey);
      return value ? JSON.parse(value) as PlayerSession : undefined;
    } catch { return undefined; }
  }
  save(session: PlayerSession): void { window.localStorage.setItem(storageKey, JSON.stringify(session)); }
  clear(): void { window.localStorage.removeItem(storageKey); }
}

export const gameClient = new GameClient(clientConfig.serverUrl, { sessionStore: new BrowserSessionStore() });
