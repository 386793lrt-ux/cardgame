import { ErrorCode } from "@riftbound/shared";

export class GameRuleError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(code);
    this.name = "GameRuleError";
  }
}
