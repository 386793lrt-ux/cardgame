# Version roadmap

## 0.1 — playable prototype

React/Vite client, Express/Socket.IO server, two-player rooms, and the first playable authoritative card battle.

## 0.2 — cross-platform architecture

Pure TypeScript game-core, shared protocol, player-specific views, stable card IDs, GameEvent, network facade, tests, and Cocos integration preparation.

## 0.3 — public multiplayer foundation

- Environment-driven HTTP/HTTPS and WebSocket/WSS endpoints.
- Stable PlayerId separated from Session token and transient SocketId.
- Automatic reconnect with a configurable grace period and authoritative state restoration.
- Action idempotency and state revisions.
- Runtime input validation, per-socket rate limiting, strict production CORS, cleanup, safe logs, health check, and graceful shutdown.
- Production build, platform-neutral Docker image, Render template, and deployment documentation.
- React remains the debug client; Cocos receives centralized development/production network configuration.

## 0.4 — game experience prototype

- Rebuilt the React debug client into an original dark medieval fantasy game table.
- Added adaptive fan-shaped hands, readable card detail, mana crystals, card backs, hero and minion status presentation.
- Added explicit card/attacker selection, legal target highlighting, Escape/background cancellation, and pending action protection.
- GameEvent now drives draw, play, summon, attack, damage, heal, death, turn and result presentation.
- Added short CSS transform/opacity animations, floating combat numbers, friendly errors, match intro and result overlay.
- Added an audio manager interface without bundling third-party audio assets.
- Kept authoritative rules, opponent hand secrecy, reconnect and the existing v0.3 server behavior unchanged.
