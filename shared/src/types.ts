import type { CardDefinition } from "./cards.js";

export type GameStatus = "WAITING" | "PLAYING" | "FINISHED";

export interface MinionState {
  instanceId: string;
  cardId: string;
  attack: number;
  health: number;
  maxHealth: number;
  canAttack: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  health: number;
  mana: number;
  maxMana: number;
  deck: string[];
  hand: string[];
  board: MinionState[];
}

export interface GameState {
  roomId: string;
  players: [PlayerState, PlayerState];
  currentPlayerId: string;
  turn: number;
  status: GameStatus;
  winnerId?: string;
}

export interface PublicPlayerState {
  id: string;
  name: string;
  health: number;
  mana: number;
  maxMana: number;
  deckCount: number;
  handCount: number;
  board: MinionState[];
}

export interface ClientGameState {
  roomId: string;
  you: PublicPlayerState & { hand: CardDefinition[] };
  opponent: PublicPlayerState;
  currentPlayerId: string;
  turn: number;
  status: GameStatus;
  winnerId?: string;
}

export interface RoomPlayer {
  id: string;
  name: string;
}

export interface RoomState {
  roomId: string;
  players: RoomPlayer[];
  status: GameStatus;
}

export type ActionTarget =
  | { type: "HERO"; playerId: string }
  | { type: "MINION"; playerId: string; instanceId: string };

export interface RoomActionResult {
  ok: boolean;
  roomId?: string;
  playerId?: string;
  error?: string;
}

export interface ClientToServerEvents {
  createRoom: (payload: { playerName: string }, ack: (result: RoomActionResult) => void) => void;
  joinRoom: (payload: { roomId: string; playerName: string }, ack: (result: RoomActionResult) => void) => void;
  playCard: (payload: { handIndex: number; target?: ActionTarget }) => void;
  attack: (payload: { attackerInstanceId: string; target: ActionTarget }) => void;
  endTurn: () => void;
}

export interface ServerToClientEvents {
  roomState: (state: RoomState) => void;
  gameState: (state: ClientGameState) => void;
  gameOver: (payload: { winnerId: string }) => void;
  error: (payload: { message: string }) => void;
}
