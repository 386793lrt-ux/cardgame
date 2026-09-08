export type ActionTarget =
  | { type: "HERO"; playerId: string }
  | { type: "MINION"; playerId: string; instanceId: string };

export type PlayerAction =
  | {
      type: "PLAY_CARD";
      playerId: string;
      cardInstanceId: string;
      target?: ActionTarget;
    }
  | {
      type: "ATTACK";
      playerId: string;
      attackerId: string;
      target: ActionTarget;
    }
  | { type: "END_TURN"; playerId: string }
  | { type: "SURRENDER"; playerId: string };
