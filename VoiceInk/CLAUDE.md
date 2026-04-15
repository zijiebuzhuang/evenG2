# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoiceInk is a real-time speech-to-text application for Even G2 smart glasses with a split architecture:
- **Frontend**: Static Vite app (vanilla JS) deployed to GitHub Pages
- **Server**: Node.js WebSocket gateway proxying audio to STT providers (iFlytek for Chinese, Deepgram for English)

The app captures audio from G2 glasses via Even Hub SDK, streams PCM data through WebSocket to the backend, and displays live transcripts on both phone UI and G2 display.

## Development Commands

### Setup
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install
```

### Development
```bash
# Run both frontend and server concurrently
npm run dev

# Run frontend only (Vite dev server on port 5273)
npm run dev:frontend

# Run server only (WebSocket server on port 8080)
npm run dev:server

# Test with G2 simulator
npm run simulator

# Run simulator smoke test against the automation API
# Note: this only works when the installed evenhub-simulator binary supports --automation-port.
npm run test:smoke
```

### Build & Preview
```bash
# Build frontend for production
npm run build

# Preview production build locally
npm run preview
```

### QR Code Generation
```bash
# Generate QR for local dev (http://localhost:5273)
npm run qr

# Generate QR for production deployment
VOICEINK_APP_URL=https://username.github.io/voiceink npm run qr:prod
```

### Deployment
```bash
# Deploy frontend to GitHub Pages
npm run deploy:frontend

# Deploy server to fly.io
cd server
fly launch          # first time
fly deploy          # subsequent deploys
fly secrets set IFLYTEK_APP_ID=xxx IFLYTEK_API_KEY=xxx IFLYTEK_API_SECRET=xxx DEEPGRAM_API_KEY=xxx
```

See `DEPLOY.md` for detailed deployment instructions.

## Architecture

### Frontend (Single-Page App)
- **Entry**: `index.html` → `src/main.js`
- **No framework**: Vanilla JS with direct DOM manipulation
- **Styling**: `src/styles.css` (uses CSS variables, FK Grotesk font)
- **Assets**: `public/` (SVG icons, fonts)

### Dual Connection Model
The frontend maintains two parallel connections initialized independently on app load:
1. **WebSocket** (`ws` variable) → Backend server for STT via `connectWebSocket()`
2. **Even Hub Bridge** (`bridge` variable) → G2 hardware for audio/events via `waitForEvenAppBridge()`

### Audio Flow
```
G2 Glasses (mic)
  → Even Hub SDK (audioPcm events)
  → handleG2Event() → handleAudioData()
  → WebSocket.send(binary PCM)
  → Server (server/index.js)
  → STT Provider (iFlytek or Deepgram)
  → WebSocket.send(JSON transcript)
  → ws.onmessage → addTranscript()
  → UI update + G2 display update
```

### State Management
- **Recording state**: `recordingState` ('stopped' | 'recording' | 'paused')
- **Transcripts**: `transcripts` array (in-memory during recording)
- **History**: `recordings` array (persisted to `localStorage`)
- **No database**: All data stored in browser localStorage

### G2 Display Updates
- Uses `bridge.createStartUpPageContainer()` and `bridge.rebuildPageContainer()`
- Two display modes: `buildWelcomePage()` (idle) and `buildTranscriptDisplay()` (recording)
- Root-page double tap must call `bridge.shutDownPageContainer(1)` to show the OS exit dialog; this is an EvenHub review requirement for the idle page
- Store the unsubscribe returned by `bridge.onEvenHubEvent()` and clear it before rebinding on bridge reconnect; repeated `waitForEvenAppBridge()` success paths can otherwise double-register gesture handlers
- VoiceInk uses the microphone, so cleanup must always call `bridge.audioControl(false)` on pause, stop, reconnect cleanup, and page unload
- Auto-clear timer: `scheduleG2AutoClear()` clears display after configurable delay
- **Configurable line count**: `glassesLineCount` (1–8, default 4) controls how many transcript lines appear on the G2 display
- **Bilingual mode**: When translation is enabled and source language ≠ native language, display splits lines — foreign text on top (`ceil(total/2)` lines), separator `───`, native translation below (`floor(total/2)` lines)
- Display always shows the most recent content (tail of transcript array)

### Server (WebSocket Gateway)
- **Entry**: `server/index.js`
- **STT Engines**:
  - `server/stt-iflytek-realtime.js` - iFlytek realtime WebSocket (Chinese)
  - `server/stt-deepgram-realtime.js` - Deepgram streaming API (English)
- **Translation**: `server/translate.js` - Text translation via MyMemory API (free, no key required)
- **Credential Strategy**: Server env vars take priority; falls back to client-provided keys (BYO-key mode)
- **Health Check**: `GET /health` endpoint for monitoring

### Translation Flow
```
Frontend: addTranscript() merges fragment → final sentence ready
  → shouldTranslate() checks: enabled && sourceLang !== nativeLanguage
  → requestTranslation() sends { type: 'translate', id, text, from, to }
  → Server (server/index.js) → translate.js → MyMemory API
  → Server returns { type: 'translation', id, text }
  → ws.onmessage updates transcript item's translationText
  → updateG2Display() → buildTranscriptDisplay() shows bilingual layout
```
- Translation results are **only displayed on G2 glasses**, not in the phone transcript list or recording history
- `flushPendingTranslations()` is called on pause/stop to translate any remaining untranslated items
- Each transcript item has: `{ id, text, offsetMs, translationText, translationStatus }`
- `translationStatus`: `null` (not requested) → `'pending'` → `'done'`

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

**Server** (required for production):
- `IFLYTEK_APP_ID`, `IFLYTEK_API_KEY`, `IFLYTEK_API_SECRET` - Chinese STT
- `DEEPGRAM_API_KEY` - English STT
- `ALLOWED_ORIGINS` - CORS whitelist (comma-separated)
- `WS_PORT` - WebSocket port (default 8080)
- `HTTPS_PROXY` - Optional proxy for outbound connections

**Frontend** (build-time):
- `VITE_WS_URL` - Production WebSocket URL (wss://...)
- `VITE_BASE_PATH` - Base path for GitHub Pages (e.g., `/voiceink/`)
- `VITE_DEV_WS_HOST` - Override dev WebSocket host (optional)

**Deploy Helpers**:
- `VOICEINK_APP_URL` - Public frontend URL for QR code generation

### localStorage Keys
- `voiceink_ws_url` - Manual WebSocket URL override (debug)
- `voiceink_language` - UI language ('en' | 'zh')
- `voiceink_recordings` - Recording history (JSON array)
- `voiceink_iflytek_appid`, `voiceink_iflytek_apikey`, `voiceink_iflytek_apisecret` - Client-side iFlytek credentials
- `voiceink_deepgram_key` - Client-side Deepgram API key
- `voiceink_glasses_display` - Glasses display toggle ('on' | 'off')
- `voiceink_glasses_autoclear` - Auto-clear delay (ms string)
- `voiceink_glasses_line_count` - G2 display line count ('1'–'8', default '4')
- `voiceink_translation_enabled` - Translation toggle ('on' | 'off')
- `voiceink_native_language` - Native language code ('zh' | 'en' | 'ja' | 'ko', default 'zh')

## Key Implementation Details

### iFlytek Realtime STT
The iFlytek implementation (`stt-iflytek-realtime.js`) uses a **custom WebSocket handshake** over raw TLS:
1. Manually constructs HTTP Upgrade request with HMAC-SHA1 signature
2. Parses HTTP 101 response headers
3. Wraps the TLS socket with `ws` library's WebSocket class
4. **Critical**: Do not modify the signature algorithm, frame buffering (FRAME_SIZE=1280), or session lifecycle

### Transcript Merging Logic
iFlytek returns fragmented results. The frontend merges them intelligently:
- Merges short fragments (<12 chars) with previous segment
- Merges within 3.5s window unless previous ends with sentence punctuation
- Strips leading punctuation from new segments and appends to previous
- After merging, triggers translation for finalized items (when a new item starts or sentence punctuation detected)
- Each transcript item carries a unique `id` (via `transcriptIdCounter`) for matching translation responses
- See `addTranscript()` in `src/main.js` for full logic

### Audio Visualizer
Real-time waveform visualization using RMS + zero-crossing rate:
- `updateVisualizerMeter()` calculates energy and brightness from PCM
- `animateVisualizer()` smooths values with exponential decay
- Uses `requestAnimationFrame` for 60fps updates
- See `visualizerState` object for animation state

## Testing & Debugging

### No Test Suite
This project has no automated tests. Manual testing workflow:
1. Start dev server: `npm run dev`
2. Open G2 simulator: `npm run simulator`
3. Test recording, pause, resume, stop
4. Verify transcripts appear in UI and G2 display
5. Check WebSocket connection status
6. Test G2 display line count: change Line Count in Settings (1–8), verify G2 display shows correct number of lines
7. Test translation: enable Translation toggle, select a Native Language different from the active STT engine, verify bilingual display on G2 (foreign text on top, native translation below, separated by `───`)
8. Verify translation skips when source language matches native language

### Debug Tools
- **localStorage override**: Set `voiceink_ws_url` to test different backends
- **Server logs**: Check `server/server.log` for WebSocket events
- **Browser console**: Frontend logs connection status, G2 events, transcript updates
- **Simulator automation API**: `npm run test:smoke` expects an evenhub-simulator build that supports `--automation-port`; the current local binary may not expose that flag yet, so the smoke test will fail fast with a clear compatibility error instead of hanging

### Common Issues
- **"Not Connected"**: Check WebSocket URL, server running, CORS settings
- **No audio**: Verify G2 bridge initialized (`bridgeReady` flag), glasses paired
- **iFlytek errors**: Check credentials, signature algorithm unchanged
- **Transcript not showing on G2**: Verify `glassesDisplayOn` setting, check `updateG2Display()` calls
- **Translation not appearing on G2**: Check `translationEnabled` is on, source language ≠ native language, server is running and reachable. Check server logs for translation errors.

## Code Style Notes

- **No TypeScript**: Plain JavaScript (ES modules)
- **No linter**: No ESLint/Prettier config
- **Minimal dependencies**: Vite for bundling, concurrently for dev, gh-pages for deploy
- **Direct DOM**: No React/Vue - uses `document.getElementById()` and event listeners
- **Inline styles**: Some dynamic styles set via `.style.property` in JS
- **Settings card spacing**: Toggle cards (`.main-card.toggle-card`) followed by settings cards (`.settings-card`) must always have **6px** `margin-top` between them. The CSS rule `.toggle-card + .settings-card` handles this — do not remove it, and ensure any new settings card placed after a toggle card gets the same spacing.
