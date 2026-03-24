# VoiceInk Deployment Guide

VoiceInk uses a split-deploy architecture:

| Component | Runtime | Deployment |
|-----------|---------|------------|
| **Frontend** | Static HTML/JS/CSS | GitHub Pages |
| **Server** | Node.js WebSocket | Any Node host (VPS, fly.io, Railway, etc.) |

## Prerequisites

- Node.js >= 20
- GitHub repository with Pages enabled
- A Node-capable public host for the WebSocket server

## 1. Configure Environment

```bash
cp .env.example .env
```

Fill in:
- `VITE_WS_URL=wss://api.voiceink.example.com` — production WebSocket endpoint
- `IFLYTEK_APP_ID`, `IFLYTEK_API_KEY`, `IFLYTEK_API_SECRET` — server-side iFlytek credentials
- `DEEPGRAM_API_KEY` — server-side Deepgram credentials
- `ALLOWED_ORIGINS=https://<username>.github.io` — frontend domain for CORS
- `VOICEINK_APP_URL=https://<username>.github.io/voiceink` — for QR code generation

## 2. Deploy Frontend (GitHub Pages)

### Option A: Automatic (GitHub Actions) — Recommended

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source** → set to `gh-pages` branch
3. Set these **Repository Variables** (Settings → Secrets and variables → Actions → Variables):
   - `VITE_WS_URL` = `wss://api.voiceink.example.com`
   - `VITE_BASE_PATH` = `/voiceink/` (your repo name, with slashes) — or `/` if using a custom domain
4. Push to `main` — GitHub Actions builds and deploys automatically

The workflow file is at `.github/workflows/deploy-frontend.yml`.

### Option B: Manual deploy from local

```bash
# Set env vars
export VITE_WS_URL=wss://api.voiceink.example.com
export VITE_BASE_PATH=/voiceink/   # your repo name

npm run deploy:frontend
```

This runs `vite build` then pushes `dist/` to the `gh-pages` branch via `gh-pages` CLI.

### Custom Domain

If you want `voiceink.yourdomain.com` instead of `<user>.github.io/voiceink`:

1. Add a `CNAME` file to `public/` containing your custom domain
2. Uncomment the `cname:` line in `.github/workflows/deploy-frontend.yml`
3. Set `VITE_BASE_PATH=/` (custom domains use root path)
4. Configure DNS: CNAME `voiceink.yourdomain.com` → `<username>.github.io`

## 3. Deploy Server

The Node WebSocket server needs a host that supports persistent connections.

### Option A: fly.io (recommended free tier)

```bash
cd server
fly launch          # first time: creates fly.toml
fly secrets set IFLYTEK_APP_ID=xxx IFLYTEK_API_KEY=xxx IFLYTEK_API_SECRET=xxx
fly secrets set DEEPGRAM_API_KEY=xxx
fly secrets set ALLOWED_ORIGINS=https://<username>.github.io
fly deploy
```

### Option B: Railway

1. Connect your GitHub repo to Railway
2. Set root directory to `VoiceInk/server`
3. Set environment variables in the Railway dashboard
4. Railway auto-deploys on push

### Option C: VPS / Cloud VM

```bash
# On your server
git clone <repo>
cd VoiceInk
cp .env.example .env   # edit with production values
cd server
npm install
node index.js
```

Use a process manager (pm2, systemd) and a reverse proxy (nginx, caddy) for TLS termination.

## 4. Generate QR Code

```bash
# Local dev QR (points to http://localhost:5173)
npm run qr

# Production QR (points to VOICEINK_APP_URL)
VOICEINK_APP_URL=https://<username>.github.io/voiceink npm run qr:prod
```

## Architecture

```
┌──────────────┐    HTTPS    ┌────────────────────────────┐
│  Even G2     │ ──────────▶ │  GitHub Pages Frontend     │
│  Glasses     │   (scan QR) │  <user>.github.io/voiceink │
└──────────────┘             └──────────────┬─────────────┘
                                            │ WSS
                                            ▼
                               ┌────────────────────────┐
                               │  Node WebSocket Server  │
                               │  api.voiceink.example  │
                               │                        │
                               │  ┌─ iFlytek STT ─────┐│
                               │  └─ Deepgram STT ────┘│
                               └────────────────────────┘
```

## Credential Strategy

- **Production**: Server env vars hold STT credentials. Clients don't need to provide keys.
- **BYO-key mode**: If server has no credentials, clients can still provide their own via Settings.
- **Debug override**: `localStorage.voiceink_ws_url` overrides the WebSocket endpoint.
