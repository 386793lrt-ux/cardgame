export type GameEvent =
  | { type: "GAME_STARTED"; gameId: string; firstPlayerId: string }
  | { type: "TURN_STARTED"; playerId: string; turn: number }
  | { type: "TURN_ENDED"; playerId: string; turn: number }
  | { type: "CARD_DRAWN"; playerId: string; cardInstanceId?: string; definitionId?: string }
  | { type: "CARD_PLAYED"; playerId: string; cardInstanceId: string; definitionId: string }
  | { type: "MANA_SPENT"; playerId: string; amount: number }
  | { type: "MINION_SUMMONED"; playerId: string; instanceId: string; definitionId: string }
  | { type: "DAMAGE_DEALT"; sourceId: string; targetId: string; amount: number }
  | { type: "HEAL_APPLIED"; targetId: string; amount: number }
  | { type: "MINION_DIED"; playerId: string; instanceId: string }
  | { type: "PLAYER_SURRENDERED"; playerId: string }
  | { type: "GAME_OVER"; winnerId: string };
