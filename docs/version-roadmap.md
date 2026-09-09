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

## 0.4 — to be planned after 0.3 public acceptance

Do not begin automatically. Likely candidates are a real Cocos Creator playable slice and platform lifecycle work, subject to the public server test results.
