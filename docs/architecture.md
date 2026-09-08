# Riftbound Duel architecture

## Runtime flow

```text
React legacy client / future Cocos client
        ↓ PlayerAction only
packages/shared: protocol + GameClient SDK
        ↓ Socket.IO transport
apps/server: identity, rooms, validation, logging
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

## Package boundaries

- `packages/game-core`: pure TypeScript rules and the full secret state. No UI, transport, database, or platform APIs.
- `packages/shared`: public card/view types, actions, events, errors, network SDK, localization keys, and platform contracts.
- `apps/server`: Express/Socket.IO gateway, room ownership, secure view generation, configuration, and safe logs.
- `client`: preserved React 0.1 validation client, now using `GameClient` instead of Socket.IO directly.
- `apps/client-cocos`: compile-tested Cocos-facing facade and project integration plan. It is not yet a generated Creator project.

## Platform identity

Gameplay uses internal `playerId`/future `userId`. `PlatformAdapter` separates development, WeChat, Steam, and Epic identities. Version 0.2 implements anonymous development identity only.
