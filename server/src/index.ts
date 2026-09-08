import { randomInt } from "node:crypto";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { Server, type Socket } from "socket.io";
import type {
  ClientToServerEvents,
  GameState,
  RoomActionResult,
  RoomState,
  ServerToClientEvents
} from "@riftbound/shared";
import { attack, createGame, endTurn, GameRuleError, playCard, toClientState } from "./game-engine.js";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

interface Room {
  id: string;
  players: { id: string; name: string }[];
  game?: GameState;
}

const app = express();
app.use(cors());
app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "riftbound-server" });
});

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const clientDist = resolve(serverDirectory, "../../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((request, response, next) => {
    if (request.method === "GET" && !request.path.startsWith("/socket.io") && request.accepts("html")) {
      response.sendFile(join(clientDist, "index.html"));
      return;
    }
    next();
  });
}

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: true, methods: ["GET", "POST"] }
});

const rooms = new Map<string, Room>();
const socketRooms = new Map<string, string>();

function safeName(value: string): string {
  const name = value.trim().slice(0, 16);
  return name || "无名旅者";
}

function createRoomCode(): string {
  let code = "";
  do code = randomInt(100000, 1_000_000).toString(); while (rooms.has(code));
  return code;
}

function roomState(room: Room): RoomState {
  return {
    roomId: room.id,
    players: room.players,
    status: room.game?.status ?? "WAITING"
  };
}

function emitState(room: Room): void {
  io.to(room.id).emit("roomState", roomState(room));
  if (!room.game) return;
  room.players.forEach((player) => {
    io.to(player.id).emit("gameState", toClientState(room.game!, player.id));
  });
  if (room.game.status === "FINISHED" && room.game.winnerId) {
    io.to(room.id).emit("gameOver", { winnerId: room.game.winnerId });
  }
}

function currentRoom(socket: GameSocket): Room {
  const roomId = socketRooms.get(socket.id);
  const room = roomId ? rooms.get(roomId) : undefined;
  if (!room) throw new GameRuleError("你当前不在房间中。");
  return room;
}

function runAction(socket: GameSocket, action: (room: Room) => void): void {
  try {
    const room = currentRoom(socket);
    if (!room.game) throw new GameRuleError("游戏尚未开始。");
    action(room);
    emitState(room);
  } catch (error) {
    const message = error instanceof GameRuleError ? error.message : "服务器无法处理这次操作。";
    socket.emit("error", { message });
  }
}

io.on("connection", (socket) => {
  socket.on("createRoom", ({ playerName }, ack) => {
    if (socketRooms.has(socket.id)) return ack({ ok: false, error: "你已经在一个房间中。" });
    const roomId = createRoomCode();
    const room: Room = { id: roomId, players: [{ id: socket.id, name: safeName(playerName) }] };
    rooms.set(roomId, room);
    socketRooms.set(socket.id, roomId);
    socket.join(roomId);
    ack({ ok: true, roomId, playerId: socket.id });
    emitState(room);
  });

  socket.on("joinRoom", ({ roomId, playerName }, ack) => {
    const normalizedId = roomId.trim();
    if (socketRooms.has(socket.id)) return ack({ ok: false, error: "你已经在一个房间中。" });
    const room = rooms.get(normalizedId);
    if (!room) return ack({ ok: false, error: "房间不存在，请检查房间码。" });
    if (room.players.length >= 2) return ack({ ok: false, error: "房间已经满了。" });

    room.players.push({ id: socket.id, name: safeName(playerName) });
    socketRooms.set(socket.id, normalizedId);
    socket.join(normalizedId);
    room.game = createGame(normalizedId, [room.players[0]!, room.players[1]!]);
    ack({ ok: true, roomId: normalizedId, playerId: socket.id });
    emitState(room);
  });

  socket.on("playCard", ({ handIndex, target }) => {
    runAction(socket, (room) => playCard(room.game!, socket.id, handIndex, target));
  });

  socket.on("attack", ({ attackerInstanceId, target }) => {
    runAction(socket, (room) => attack(room.game!, socket.id, attackerInstanceId, target));
  });

  socket.on("endTurn", () => {
    runAction(socket, (room) => endTurn(room.game!, socket.id));
  });

  socket.on("disconnect", () => {
    const roomId = socketRooms.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    socketRooms.delete(socket.id);
    if (!room) return;
    room.players.filter((player) => player.id !== socket.id).forEach((player) => {
      io.to(player.id).emit("error", { message: "对手已断开连接，房间已关闭。" });
    });
    room.players.forEach((player) => socketRooms.delete(player.id));
    rooms.delete(roomId);
  });
});

const port = Number(process.env.PORT ?? 3001);
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Riftbound server listening on http://0.0.0.0:${port}`);
});

export type { RoomActionResult };
