# Deployment guide — 0.3

## Architecture

Both players connect to the same public Node.js service. Express serves the built React debug client and `/health`; Socket.IO uses the same HTTPS origin and automatically negotiates secure WSS. No home router, port forwarding, UPnP, or firewall changes are required.

## Development

Copy `.env.example` to `.env` only when overriding defaults, then run:

```powershell
npm install
npm run dev
```

The debug client is at `http://localhost:5173`, the server is at `http://localhost:3001`, and the health endpoint is `http://localhost:3001/health`.

## Production configuration

Use `.env.production.example` as the variable checklist. Required production values:

- `NODE_ENV=production`
- `PORT`: supplied by the hosting provider, normally `3000` in Docker
- `HOST=0.0.0.0`: required for public container hosting
- `ALLOWED_ORIGINS`: comma-separated exact HTTPS client origins; wildcard is rejected

Recommended values:

- `RECONNECT_GRACE_PERIOD_MS=60000`
- `WAITING_ROOM_TTL_MS=600000`
- `FINISHED_ROOM_TTL_MS=300000`
- `ROOM_CLEANUP_INTERVAL_MS=10000`
- `RATE_LIMIT_WINDOW_MS=10000`
- `CREATE_ROOM_RATE_LIMIT=5`
- `JOIN_ROOM_RATE_LIMIT=20`
- `ACTION_RATE_LIMIT=80`
- `LOG_LEVEL=info`
- `VITE_GAME_SERVER_URL=https://your-public-service.example.com` when the web client is hosted separately; omit it when Express serves the client from the same origin

Never commit the real `.env`, tokens, certificates, or provider credentials.

## Build and start

```powershell
npm ci
npm run build
$env:NODE_ENV="production"
$env:PORT="3000"
$env:ALLOWED_ORIGINS="https://your-game.example.com"
npm start
```

Check `https://your-game.example.com/health`. A successful response contains `status: "ok"`, version, and uptime only.

## Docker

```powershell
docker build -t riftbound-server:0.3 .
docker run --rm -p 3000:3000 --env-file .env.production riftbound-server:0.3
```

Use a hosting provider that terminates TLS automatically. The application listens on `0.0.0.0:$PORT`; do not expose a Windows development machine to the internet.

## Render or another Node host

The repository contains `render.yaml`. Set `ALLOWED_ORIGINS` to the final public HTTPS URL in the provider dashboard. The same build/start/health contract also works on Railway, Fly.io, a VPS, or another container host without changing game-core.

For an Alibaba Cloud Windows Server direct-IP deployment, use `docs/deployment-windows-ecs.md` and `scripts/windows-deploy.ps1`.

## Current persistence limit

Rooms and sessions live in one server process. Restarting or replacing that process loses active games. Multi-instance deployment is unsupported until a later Redis/database version; run exactly one application instance for 0.3 testing.
