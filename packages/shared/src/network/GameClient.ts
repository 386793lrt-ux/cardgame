import { io, type Socket } from "socket.io-client";
import type { ErrorCode } from "../enums/index.js";
import type { ActionTarget, PlayerAction } from "./actions.js";
import type { GameEvent } from "./events.js";
import type { ClientToServerEvents, RoomActionResult, ServerToClientEvents } from "./protocol.js";
import type { PlayerViewState, RoomState } from "./views.js";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type Unsubscribe = () => void;

export class GameClient {
  private readonly socket: GameSocket;
  private playerId?: string;

  constructor(serverUrl: string) {
    this.socket = io(serverUrl, { autoConnect: false, transports: ["websocket", "polling"] });
  }

  connect(): void {
    if (!this.socket.connected) this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  getPlayerId(): string | undefined {
    return this.playerId;
  }

  async createRoom(playerName: string): Promise<RoomActionResult> {
    const result = await new Promise<RoomActionResult>((resolve) => {
      this.socket.emit("CREATE_ROOM", { playerName }, resolve);
    });
    if (result.ok) this.playerId = result.playerId;
    return result;
  }

  async joinRoom(roomId: string, playerName: string): Promise<RoomActionResult> {
    const result = await new Promise<RoomActionResult>((resolve) => {
      this.socket.emit("JOIN_ROOM", { roomId, playerName }, resolve);
    });
    if (result.ok) this.playerId = result.playerId;
    return result;
  }

  playCard(cardInstanceId: string, target?: ActionTarget): void {
    if (!this.playerId) return;
    this.sendAction({ type: "PLAY_CARD", playerId: this.playerId, cardInstanceId, target });
  }

  attack(attackerId: string, target: ActionTarget): void {
    if (!this.playerId) return;
    this.sendAction({ type: "ATTACK", playerId: this.playerId, attackerId, target });
  }

  endTurn(): void {
    if (this.playerId) this.sendAction({ type: "END_TURN", playerId: this.playerId });
  }

  surrender(): void {
    if (this.playerId) this.sendAction({ type: "SURRENDER", playerId: this.playerId });
  }

  sendAction(action: PlayerAction): void {
    this.socket.emit("PLAYER_ACTION", action);
  }

  onConnectionChange(handler: (connected: boolean) => void): Unsubscribe {
    const connected = () => handler(true);
    const disconnected = () => handler(false);
    this.socket.on("connect", connected);
    this.socket.on("disconnect", disconnected);
    return () => {
      this.socket.off("connect", connected);
      this.socket.off("disconnect", disconnected);
    };
  }

  onRoomState(handler: (state: RoomState) => void): Unsubscribe {
    this.socket.on("ROOM_STATE", handler);
    return () => this.socket.off("ROOM_STATE", handler);
  }

  onGameUpdate(handler: (state: PlayerViewState, events: GameEvent[]) => void): Unsubscribe {
    const listener = (payload: { state: PlayerViewState; events: GameEvent[] }) => handler(payload.state, payload.events);
    this.socket.on("GAME_UPDATE", listener);
    return () => this.socket.off("GAME_UPDATE", listener);
  }

  onError(handler: (code: ErrorCode) => void): Unsubscribe {
    const listener = (payload: { code: ErrorCode }) => handler(payload.code);
    this.socket.on("GAME_ERROR", listener);
    return () => this.socket.off("GAME_ERROR", listener);
  }
}
