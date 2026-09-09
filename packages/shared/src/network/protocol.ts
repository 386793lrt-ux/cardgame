import type { ErrorCode } from "../enums/index.js";
import type { PlayerAction } from "./actions.js";
import type { GameEvent } from "./events.js";
import type { PlayerSession, PlayerViewState, RoomState } from "./views.js";

export const GAME_PROTOCOL_VERSION = "0.3.0";

export interface RoomActionResult {
  ok: boolean;
  roomId?: string;
  playerId?: string;
  session?: PlayerSession;
  errorCode?: ErrorCode;
}

export interface PlayerActionResult {
  ok: boolean;
  actionId: string;
  duplicate?: boolean;
  stateRevision?: number;
  errorCode?: ErrorCode;
}

export interface ReconnectResult {
  ok: boolean;
  roomId?: string;
  playerId?: string;
  stateRevision?: number;
  errorCode?: ErrorCode;
}

export interface ClientToServerEvents {
  CREATE_ROOM: (payload: { playerName: string }, ack: (result: RoomActionResult) => void) => void;
  CREATE_AI_GAME: (payload: { playerName: string }, ack: (result: RoomActionResult) => void) => void;
  JOIN_ROOM: (payload: { roomId: string; playerName: string }, ack: (result: RoomActionResult) => void) => void;
  RECONNECT_GAME: (payload: PlayerSession, ack: (result: ReconnectResult) => void) => void;
  PLAYER_ACTION: (action: PlayerAction, ack: (result: PlayerActionResult) => void) => void;
}

export interface ServerToClientEvents {
  ROOM_STATE: (state: RoomState) => void;
  GAME_UPDATE: (payload: { state: PlayerViewState; events: GameEvent[] }) => void;
  GAME_ERROR: (payload: { code: ErrorCode }) => void;
  OPPONENT_CONNECTION: (payload: { connected: boolean; graceExpiresAt?: number }) => void;
  SERVER_INFO: (payload: { version: string }) => void;
}
