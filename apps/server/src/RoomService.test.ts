import assert from "node:assert/strict";
import test from "node:test";
import { ErrorCode } from "@riftbound/shared";
import { Logger } from "./logger.js";
import { RoomService, RoomServiceError } from "./RoomService.js";

test("room service creates, joins, starts, and advances an authoritative game", () => {
  const service = new RoomService(new Logger("error"));
  const room = service.createRoom("P1", "甲");
  assert.match(room.roomId, /^\d{6}$/);
  const joined = service.joinRoom(room.roomId, "P2", "乙");
  assert.equal(joined.room.game?.status, "PLAYING");
  const currentPlayerId = joined.room.game!.currentPlayerId;
  const result = service.applyPlayerAction(currentPlayerId, { type: "END_TURN", playerId: currentPlayerId });
  assert.equal(result.result.state.turn, 2);
  assert.notEqual(result.result.state.currentPlayerId, currentPlayerId);
});

test("room service rejects a spoofed player id", () => {
  const service = new RoomService(new Logger("error"));
  const room = service.createRoom("P1", "甲");
  service.joinRoom(room.roomId, "P2", "乙");
  assert.throws(
    () => service.applyPlayerAction("P1", { type: "END_TURN", playerId: "P2" }),
    (error) => error instanceof RoomServiceError && error.code === ErrorCode.PLAYER_ID_MISMATCH
  );
});
