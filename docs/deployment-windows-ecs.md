# Alibaba Cloud ECS — Windows Server deployment

This is the v0.3 direct-IP test path. It does not use Linux, systemd, apt, Nginx, or home-router port forwarding.

## Runtime contract

- Build: `npm run build`
- Test: `npm test`
- Start: `npm start`
- Listen address: `HOST=0.0.0.0`
- Test port: `PORT=3000`
- Local health: `http://127.0.0.1:3000/health`
- Public health: `http://PUBLIC_IP:3000/health`

Node.js 24 LTS, npm, and Git for Windows are required. Download installers only from `nodejs.org` and `git-scm.com` if they are absent.

## Source and build

For a public repository:

```powershell
Set-Location C:\
git clone REPOSITORY_URL CardGame
Set-Location C:\CardGame
powershell -ExecutionPolicy Bypass -File .\scripts\windows-deploy.ps1
```

For an existing clone, use `git pull --ff-only` before running the deployment script. For a private repository, use Git Credential Manager's browser authorization or a read-only deploy key; never place a GitHub password or token in a command or file.

## Production environment

```powershell
Copy-Item .env.production.example .env
notepad .env
```

For the direct-IP phase, set `ALLOWED_ORIGINS` to the exact browser origin, for example `http://PUBLIC_IP:3000`. Keep `VITE_GAME_SERVER_URL` empty because Express serves the web client from the same origin. The `.env` file is ignored by Git.

## Start and verify

```powershell
npm start
```

In a second Administrator PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/health
```

Only after this succeeds, add narrowly scoped inbound TCP 3000 rules in Windows Defender Firewall and the ECS security group. Keep RDP 3389 limited to trusted source IPs. Do not open all ports or disable the firewall.

## Persistence limitation

Rooms remain in process memory. A server process or Windows restart loses active games. Configure a Windows auto-start mechanism only after the first public direct-IP test succeeds.
