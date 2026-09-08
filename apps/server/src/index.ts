import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { Server, type Socket } from "socket.io";
import { createPlayerEvents, createPlayerView } from "@riftbound/game-core";
import {
  ErrorCode,
  type ClientToServerEvents,
  type GameEvent,
  type RoomActionResult,
  type ServerToClientEvents
} from "@riftbound/shared";
import { serverConfig } from "./config.js";
import { Logger } from "./logger.js";
import { errorCodeOf, RoomService, type Room } from "./RoomService.js";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
const logger = new Logger(serverConfig.logLevel);
const roomService = new RoomService(logger);

const app = express();
app.use(cors({ origin: serverConfig.allowedOrigins }));
app.get("/health", (_request, response) => response.json({ ok: true, service: "riftbound-server", version: "0.2.0" }));

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const clientDist = resolve(serverDirectory, "../../../client/dist");
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
  cors: { origin: serverConfig.allowedOrigins, methods: ["GET", "POST"] }
});

function emitRoomState(room: Room): void {
  io.to(room.roomId).emit("ROOM_STATE", roomService.toRoomState(room));
}

function emitGameUpdate(room: Room, events: readonly GameEvent[]): void {
  if (!room.game) return;
  room.players.forEach((player) => {
    io.to(player.playerId).emit("GAME_UPDATE", {
      state: createPlayerView(room.game!, player.playerId),
      events: createPlayerEvents(events, player.playerId)
    });
  });
}

function fail(socket: GameSocket, error: unknown): ErrorCode {
  const code = errorCodeOf(error);
  logger.warn("action_rejected", { playerId: socket.id, errorCode: code });
  socket.emit("GAME_ERROR", { code });
  return code;
}

io.on("connection", (socket) => {
  logger.info("player_connected", { playerId: socket.id });

  socket.on("CREATE_ROOM", ({ playerName }, ack) => {
    try {
      const room = roomService.createRoom(socket.id, playerName);
      socket.join(room.roomId);
      const result: RoomActionResult = { ok: true, roomId: room.roomId, playerId: socket.id };
      ack(result);
      emitRoomState(room);
    } catch (error) {
      ack({ ok: false, errorCode: fail(socket, error) });
    }
  });

  socket.on("JOIN_ROOM", ({ roomId, playerName }, ack) => {
    try {
      const { room, initial } = roomService.joinRoom(roomId, socket.id, playerName);
      socket.join(room.roomId);
      ack({ ok: true, roomId: room.roomId, playerId: socket.id });
      emitRoomState(room);
      emitGameUpdate(room, initial.events);
    } catch (error) {
      ack({ ok: false, errorCode: fail(socket, error) });
    }
  });

  socket.on("PLAYER_ACTION", (action) => {
    try {
      const { room, result } = roomService.applyPlayerAction(socket.id, action);
      emitGameUpdate(room, result.events);
    } catch (error) {
      fail(socket, error);
    }
  });

  socket.on("disconnect", () => {
    logger.info("player_disconnected", { playerId: socket.id });
    const closed = roomService.disconnect(socket.id);
    closed?.remainingPlayerIds.forEach((playerId) => {
      io.to(playerId).emit("GAME_ERROR", { code: ErrorCode.OPPONENT_DISCONNECTED });
    });
  });
});

httpServer.listen(serverConfig.port, "0.0.0.0", () => {
  logger.info("server_started", { port: serverConfig.port });
});
