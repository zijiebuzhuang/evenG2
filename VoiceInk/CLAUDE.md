# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development commands

### Prerequisites
- Node.js >= 20
- Install dependencies in both places:

```bash
npm install
cd server && npm install
```

### Local development
```bash
# frontend + WebSocket server
npm run dev

# frontend only (Vite on 0.0.0.0:5273)
npm run dev:frontend

# backend only (WebSocket server on :8080)
npm run dev:server

# launch Even Hub simulator against the local frontend
npm run simulator

# simulator automation smoke test
npm run test:smoke
```

### Build / preview / deploy
```bash
npm run build
npm run preview
npm run deploy:frontend
npm run qr
VOICEINK_APP_URL=https://<host> npm run qr:prod
```

### What is not available
- No lint script
- No typecheck script
- No Jest/Vitest/Playwright test suite
- No single-test command; `npm run test:smoke` is the only automated app-level check

## High-level architecture

VoiceInk is a split deployment:
- **Frontend**: Vite app in plain JavaScript, rendered with direct DOM updates
- **Backend**: standalone Node.js WebSocket server in `server/`
- **Device integration**: Even G2 bridge via `@evenrealities/even_hub_sdk`
- **STT providers**: iFlytek for Chinese and Deepgram for the English path

The frontend is not React/Vue/TypeScript. Most app behavior lives in `src/main.js`, so changes usually require understanding state transitions there instead of looking for framework abstractions.

## Core runtime model

### Two independent connections start on load
The frontend brings up two channels separately:
1. **Backend WebSocket** via `connectWebSocket()` for STT and translation
2. **Even Hub bridge** via `waitForEvenAppBridge()` for G2 events, audio, and display control

These are independent. A partial startup is common: the phone UI can load while the bridge is not ready, or vice versa. When debugging startup issues, verify both paths instead of assuming a single initialization failure.

### Audio / transcription flow
1. G2 emits `audioPcm` events through the Even bridge
2. `handleG2Event()` routes PCM into `handleAudioData()`
3. Frontend sends raw PCM frames over the backend WebSocket
4. `server/index.js` opens the selected realtime STT session
5. Server streams back `transcription_partial` and `transcription`
6. Frontend merges segments in `addTranscript()` and updates both phone UI and glasses display

The segment model is not one-provider-result to one UI row. `addTranscript()` contains merge heuristics, especially for iFlytek fragments and punctuation, so transcript behavior should be changed carefully.

### Translation is a separate async pass
Translation is not part of the STT stream. The frontend decides when to request translation, the backend handles `translate` messages in `server/translate.js`, and the result is attached back onto transcript items. Translations feed the glasses display, but the phone transcript/history UI renders the original transcript text only.

## Provider and credential model

- Frontend engine names are `iflytek` and `whisper`
- The backend maps `whisper` to the Deepgram realtime implementation
- Server environment variables take priority over client-provided keys
- If the server has no credentials, the app can still run in BYO-key mode using keys saved in browser `localStorage`
- On connect, the server sends a `capabilities` message so the frontend can decide whether settings input is required

Relevant env/config:
- root `.env.example`
- `server/index.js`
- `src/main.js`

## Persistence model

There is no database. Important state is browser-local:
- settings and API keys in `localStorage`
- saved recording history in `localStorage.voiceink_recordings`
- in-memory live transcript state during the current recording session

Do not assume server-side history or session recovery exists.

## G2-specific invariants

These behaviors are easy to break and should be preserved unless the task explicitly changes them:

- Keep the unsubscribe returned by `bridge.onEvenHubEvent()` and clear it before rebinding on reconnect
- Call `bridge.audioControl(false)` during pause/stop paths, reconnect cleanup, and unload cleanup
- G2 page lifecycle goes through startup-page/container APIs; display updates are not just DOM state mirrored to hardware
- G2 display updates are throttled to avoid overwhelming the Bluetooth bridge
- Root-page double tap must call `bridge.shutDownPageContainer(1)` to open the system exit dialog
- Single-click / double-click behavior on glasses is stateful: stopped -> start, recording -> pause, paused -> stop

When changing bridge code, trace both the happy path and cleanup path.

## Simulator and smoke testing

The simulator is the main validation path.

- `npm run simulator` launches `evenhub-simulator --glow http://localhost:5273`
- `npm run test:smoke` uses the simulator automation API at `http://127.0.0.1:9898`
- The smoke test treats these console logs as readiness signals:
  - `G2 bridge initialized`
  - `G2 page created`
  - `G2 bridge reconnected`

If the smoke test fails before interaction, inspect startup console output first.

## Deployment-sensitive details

- Production frontend builds require `VITE_WS_URL`; without it, the app logs an error and will not connect to the backend
- Dev mode defaults to `ws://localhost:8080` unless `VITE_DEV_WS_HOST` is set
- Vite runs on port `5273`, not `5173`
- `VITE_BASE_PATH` controls GitHub Pages subpath builds
- `app.json` currently whitelists only `https://voiceink-server.onrender.com` for network access, so changing the production backend host may require updating the whitelist too

## Files worth reading before major changes

- `src/main.js` — app state, bridge lifecycle, transcript merging, translation scheduling, display updates
- `server/index.js` — WebSocket protocol, provider selection, credential precedence
- `server/stt-iflytek-realtime.js` — fragile iFlytek realtime handshake and frame buffering
- `server/stt-deepgram-realtime.js` — Deepgram realtime path
- `scripts/simulator-smoke.mjs` — expected simulator startup behavior and interaction sequence
- `DEPLOY.md` — split deployment and environment setup

## Known fragile areas

- The iFlytek realtime implementation is sensitive to handshake/signature details and frame sizing; do not casually rewrite it
- Startup bugs often come from one of three places: bridge initialization never becomes ready, backend WebSocket is unavailable, or production env vars are missing
- G2 display bugs are often lifecycle bugs, not rendering bugs: stale event subscriptions, missing cleanup, or page-container state getting out of sync
