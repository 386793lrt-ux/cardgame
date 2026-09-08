import { randomInt } from "node:crypto";
import {
  createGame,
  executeAction,
  GameRuleError,
  type GameResult,
  type GameState
} from "@riftbound/game-core";
import { ErrorCode, type PlayerAction, type RoomState } from "@riftbound/shared";
import type { Logger } from "./logger.js";

export interface RoomPlayer {
  playerId: string;
  name: string;
}

export interface Room {
  roomId: string;
  players: RoomPlayer[];
  game?: GameState;
}

export class RoomServiceError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(code);
  }
}

function safeName(value: string): string {
  return value.trim().slice(0, 16) || "无名旅者";
}

export class RoomService {
  private readonly rooms = new Map<string, Room>();
  private readonly playerRooms = new Map<string, string>();

  constructor(private readonly logger: Logger) {}

  createRoom(playerId: string, playerName: string): Room {
    if (this.playerRooms.has(playerId)) throw new RoomServiceError(ErrorCode.ALREADY_IN_ROOM);
    const roomId = this.createRoomCode();
    const room: Room = { roomId, players: [{ playerId, name: safeName(playerName) }] };
    this.rooms.set(roomId, room);
    this.playerRooms.set(playerId, roomId);
    this.logger.info("room_created", { roomId, playerId });
    return room;
  }

  joinRoom(roomId: string, playerId: string, playerName: string): { room: Room; initial: GameResult } {
    if (this.playerRooms.has(playerId)) throw new RoomServiceError(ErrorCode.ALREADY_IN_ROOM);
    const room = this.rooms.get(roomId.trim());
    if (!room) throw new RoomServiceError(ErrorCode.ROOM_NOT_FOUND);
    if (room.players.length >= 2) throw new RoomServiceError(ErrorCode.ROOM_FULL);
    room.players.push({ playerId, name: safeName(playerName) });
    this.playerRooms.set(playerId, room.roomId);
    this.logger.info("room_joined", { roomId: room.roomId, playerId });

    const gameId = `GAME_${room.roomId}_${Date.now()}`;
    const initial = createGame(gameId, room.roomId, [room.players[0]!, room.players[1]!], randomInt(1, 0x7fffffff));
    room.game = initial.state;
    this.logger.info("game_started", { roomId: room.roomId, gameId });
    return { room, initial };
  }

  applyPlayerAction(connectionPlayerId: string, action: PlayerAction): { room: Room; result: GameResult } {
    if (action.playerId !== connectionPlayerId) throw new RoomServiceError(ErrorCode.PLAYER_ID_MISMATCH);
    const room = this.roomForPlayer(connectionPlayerId);
    if (!room.game) throw new RoomServiceError(ErrorCode.GAME_NOT_STARTED);
    const result = executeAction(room.game, action);
    room.game = result.state;
    if (result.state.status === "FINISHED") {
      this.logger.info("game_finished", { roomId: room.roomId, gameId: result.state.gameId, winnerId: result.state.winnerId });
    }
    return { room, result };
  }

  disconnect(playerId: string): { roomId: string; remainingPlayerIds: string[] } | undefined {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return undefined;
    const room = this.rooms.get(roomId);
    this.playerRooms.delete(playerId);
    if (!room) return undefined;
    const remainingPlayerIds = room.players.filter((player) => player.playerId !== playerId).map((player) => player.playerId);
    room.players.forEach((player) => this.playerRooms.delete(player.playerId));
    this.rooms.delete(roomId);
    this.logger.info("room_closed_on_disconnect", { roomId, playerId });
    return { roomId, remainingPlayerIds };
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  toRoomState(room: Room): RoomState {
    return {
      roomId: room.roomId,
      players: room.players.map((player) => ({ ...player })),
      status: room.game?.status ?? "WAITING"
    };
  }

  private roomForPlayer(playerId: string): Room {
    const roomId = this.playerRooms.get(playerId);
    const room = roomId ? this.rooms.get(roomId) : undefined;
    if (!room) throw new RoomServiceError(ErrorCode.NOT_IN_ROOM);
    return room;
  }

  private createRoomCode(): string {
    let roomId = "";
    do roomId = randomInt(100000, 1_000_000).toString(); while (this.rooms.has(roomId));
    return roomId;
  }
}

export function errorCodeOf(error: unknown): ErrorCode {
  if (error instanceof GameRuleError || error instanceof RoomServiceError) return error.code;
  return ErrorCode.INTERNAL_ERROR;
}
