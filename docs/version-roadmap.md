# Version roadmap

## 0.1 — playable prototype

React/Vite client, Express/Socket.IO server, two-player rooms, and the first playable authoritative card battle.

## 0.2 — cross-platform architecture

- Extract deterministic pure TypeScript `game-core`.
- Separate `CardDefinition`, `CardInstance`, and `MinionInstance`.
- Assign stable `CARD_000001` identifiers and localization keys.
- Introduce `PlayerAction`, `GameEvent`, `ErrorCode`, player-specific views, and seeded random provider.
- Wrap transport in `GameClient` and retain the React client as a regression surface.
- Add server configuration and structured safe logging.
- Add `PlatformAdapter` with anonymous development implementation.
- Prepare, but do not fabricate, a Cocos Creator integration layer.

## 0.3 — Cocos playable vertical slice

Install Cocos Creator 3.x from the official source, create a real project, implement lobby/battle scenes, consume `PlayerViewState` and `GameEvent`, and produce a desktop/web preview from the same scene code. Add transport compatibility testing for the WeChat runtime.

## 0.4 — WeChat mini game release preparation

Implement a WeChat-only platform/transport adapter, lifecycle and reconnection behavior, package-size/performance work, privacy/compliance checks, and release testing. Login, payment, ranking, and monetization remain separately scoped decisions.
