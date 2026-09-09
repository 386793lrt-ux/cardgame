# Riftbound Duel architecture

## Runtime flow

```text
React legacy client / future Cocos client
        ↓ PlayerAction only
packages/shared: protocol + GameClient SDK
        ↓ Socket.IO transport
apps/server: sessions, rooms, runtime validation, rate limiting, logging
        ↓ executeAction(currentState, action)
packages/game-core: deterministic rules
        ↓
new GameState + GameEvent[]
        ↓ createPlayerView + createPlayerEvents
each client receives only its allowed view
```

## Authority boundary

Clients may choose an intended card, attacker, target, or end/surrender action. They may animate received `GameEvent` values and render their `PlayerViewState`.

Only the server owns the full `GameState`. Damage, healing, card draw, deck order, mana spending, legality, death, turn order, and victory are calculated by `game-core` after the server binds an action to the connected player.

The opponent hand is never serialized into `PlayerViewState`. Opponent draw events have their card instance and definition removed before transmission.

## Public session and reconnect flow

`PlayerId` identifies one seat for the lifetime of a match. `SessionToken` is a private 256-bit credential generated with Node.js `crypto`, while `SocketId` identifies only the current network connection. A reconnect supplies room, player, and token; the server verifies them and sends a freshly generated player view from its retained full state. Clients never upload health, cards, mana, or another replacement state.

Every network action contains an `actionId`, and the room retains a bounded recent set per player so retries cannot execute twice. Each successful authoritative change increments `stateRevision`. Socket.IO supplies ping/pong and reconnection transport; the application adds a configurable grace period and opponent connection notifications.

## Package boundaries

- `packages/game-core`: pure TypeScript rules and the full secret state. No UI, transport, database, or platform APIs.
- `packages/shared`: public card/view types, actions, events, errors, network SDK, localization keys, and platform contracts.
- `apps/server`: Express/Socket.IO gateway, room ownership, secure view generation, configuration, and safe logs.
- `client`: preserved React 0.1 validation client, now using `GameClient` instead of Socket.IO directly.
- `apps/client-cocos`: compile-tested Cocos-facing facade and project integration plan. It is not yet a generated Creator project.

## Platform identity

Gameplay uses internal `playerId`/future `userId`. `PlatformAdapter` separates development, WeChat, Steam, and Epic identities. Version 0.3 still implements anonymous development identity only; its session token is not a permanent account or platform login.
