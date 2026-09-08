import type { ErrorCode } from "../enums/index.js";
import type { PlayerAction } from "./actions.js";
import type { GameEvent } from "./events.js";
import type { PlayerViewState, RoomState } from "./views.js";

export interface RoomActionResult {
  ok: boolean;
  roomId?: string;
  playerId?: string;
  errorCode?: ErrorCode;
}

export interface ClientToServerEvents {
  CREATE_ROOM: (payload: { playerName: string }, ack: (result: RoomActionResult) => void) => void;
  JOIN_ROOM: (payload: { roomId: string; playerName: string }, ack: (result: RoomActionResult) => void) => void;
  PLAYER_ACTION: (action: PlayerAction) => void;
}

export interface ServerToClientEvents {
  ROOM_STATE: (state: RoomState) => void;
  GAME_UPDATE: (payload: { state: PlayerViewState; events: GameEvent[] }) => void;
  GAME_ERROR: (payload: { code: ErrorCode }) => void;
}
