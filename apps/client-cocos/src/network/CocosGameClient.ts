import {
  GameClient,
  type ActionTarget,
  type ErrorCode,
  type GameEvent,
  type PlayerViewState,
  type RoomActionResult,
  type RoomState
} from "@riftbound/shared";

/**
 * Cocos-facing facade with no dependency on cc, DOM, WeChat, Steam, or Epic APIs.
 * A future Cocos Component can own this facade and translate callbacks into scene events.
 */
export class CocosGameClient {
  private readonly client: GameClient;

  constructor(serverUrl: string) {
    this.client = new GameClient(serverUrl);
  }

  connect(): void { this.client.connect(); }
  disconnect(): void { this.client.disconnect(); }
  createRoom(playerName: string): Promise<RoomActionResult> { return this.client.createRoom(playerName); }
  joinRoom(roomId: string, playerName: string): Promise<RoomActionResult> { return this.client.joinRoom(roomId, playerName); }
  playCard(cardInstanceId: string, target?: ActionTarget): void { this.client.playCard(cardInstanceId, target); }
  attack(attackerId: string, target: ActionTarget): void { this.client.attack(attackerId, target); }
  endTurn(): void { this.client.endTurn(); }
  surrender(): void { this.client.surrender(); }
  onRoomState(handler: (state: RoomState) => void): () => void { return this.client.onRoomState(handler); }
  onGameUpdate(handler: (state: PlayerViewState, events: GameEvent[]) => void): () => void { return this.client.onGameUpdate(handler); }
  onError(handler: (code: ErrorCode) => void): () => void { return this.client.onError(handler); }
}
