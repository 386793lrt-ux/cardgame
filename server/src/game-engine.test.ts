import assert from "node:assert/strict";
import test from "node:test";
import { CARD_BY_ID, type GameState } from "@riftbound/shared";
import { attack, createGame, endTurn, GameRuleError, playCard, toClientState } from "./game-engine.js";

function game(): GameState {
  return createGame("123456", [{ id: "p1", name: "甲" }, { id: "p2", name: "乙" }], () => 0);
}

test("creates a 30-health authoritative game with asymmetric opening hands", () => {
  const state = game();
  assert.equal(state.status, "PLAYING");
  assert.equal(state.players[0].health, 30);
  const first = state.players.find((player) => player.id === state.currentPlayerId)!;
  const second = state.players.find((player) => player.id !== state.currentPlayerId)!;
  assert.equal(first.maxMana, 1);
  assert.equal(first.hand.length, 4);
  assert.equal(second.hand.length, 4);
  assert.equal(first.deck.length + first.hand.length, 20);
});

test("rejects actions from the non-current player", () => {
  const state = game();
  const other = state.players.find((player) => player.id !== state.currentPlayerId)!;
  assert.throws(() => endTurn(state, other.id), GameRuleError);
});

test("summoned minions wait a turn, then attack simultaneously", () => {
  const state = game();
  const current = state.players.find((player) => player.id === state.currentPlayerId)!;
  const other = state.players.find((player) => player.id !== state.currentPlayerId)!;
  current.hand = ["moss-scout"];
  current.mana = 10;
  playCard(state, current.id, 0);
  assert.equal(current.board[0]?.canAttack, false);
  assert.throws(() => attack(state, current.id, current.board[0]!.instanceId, { type: "HERO", playerId: other.id }), GameRuleError);
  endTurn(state, current.id);
  other.hand = ["ember-moth"];
  other.mana = 10;
  playCard(state, other.id, 0);
  endTurn(state, other.id);
  assert.equal(current.board[0]?.canAttack, true);
  attack(state, current.id, current.board[0]!.instanceId, {
    type: "MINION",
    playerId: other.id,
    instanceId: other.board[0]!.instanceId
  });
  assert.equal(other.board.length, 0);
  assert.equal(current.board.length, 0);
});

test("damage spells are server targeted and private hands stay hidden", () => {
  const state = game();
  const current = state.players.find((player) => player.id === state.currentPlayerId)!;
  const other = state.players.find((player) => player.id !== state.currentPlayerId)!;
  current.hand = ["cinder-bolt"];
  current.mana = 10;
  playCard(state, current.id, 0, { type: "HERO", playerId: other.id });
  assert.equal(other.health, 27);
  const view = toClientState(state, current.id);
  assert.equal(view.opponent.handCount, other.hand.length);
  assert.equal("hand" in view.opponent, false);
  assert.equal(CARD_BY_ID.get("cinder-bolt")?.type, "SPELL");
});

test("hero reaching zero ends the game", () => {
  const state = game();
  const current = state.players.find((player) => player.id === state.currentPlayerId)!;
  const other = state.players.find((player) => player.id !== state.currentPlayerId)!;
  current.board.push({ instanceId: "finisher", cardId: "rift-titan", attack: 30, health: 12, maxHealth: 12, canAttack: true });
  attack(state, current.id, "finisher", { type: "HERO", playerId: other.id });
  assert.equal(state.status, "FINISHED");
  assert.equal(state.winnerId, current.id);
});
