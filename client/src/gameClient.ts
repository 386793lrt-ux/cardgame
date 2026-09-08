import { GameClient } from "@riftbound/shared";
import { clientConfig } from "./config";

export const gameClient = new GameClient(clientConfig.serverUrl);
