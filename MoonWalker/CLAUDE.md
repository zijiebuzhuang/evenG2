# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoonWalker is an AR navigation web app for Even Realities G2 smart glasses. It displays minimal navigation information (direction arrow + distance) on the glasses while the user walks to a destination.

**Tech Stack**: Vite + Vanilla JS + Even Hub SDK (@evenrealities/even_hub_sdk@0.0.7)

**Location**: This is part of the evenG2 multi-app monorepo at `/Users/zijiechen/Library/Mobile Documents/com~apple~CloudDocs/AI/even-g2-dev/evenG2/`

## Development Commands

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm build

# Preview production build
npm run preview

# Start official G2 simulator with glow effect
evenhub-simulator --glow http://localhost:5173

# Generate QR code for physical G2 glasses
npm run qr
```

## Critical Development Workflow

**ALWAYS restart the simulator after code changes** - the simulator does not hot-reload.

**Process restart sequence**:
1. Check for existing processes: `ps aux | grep evenhub-simulator` and `lsof -ti:5173`
2. Kill old simulator: `pkill -f "evenhub-simulator"`
3. Kill old dev server if needed: `lsof -ti:5173 | xargs kill -9`
4. Start dev server in background: `cd [path] && npm run dev &`
5. Start simulator in background: `evenhub-simulator --glow http://localhost:5173 &`

## Architecture

### File Structure
- `index.html` - Main page + Settings page structure
- `src/main.js` - All application logic (navigation, API calls, G2 bridge, page switching)
- `src/styles.css` - Complete design system + component styles
- `src/design-system.js` - Design tokens (colors, typography) for JS usage
- `public/` - Static assets (SVG icons, fonts, images)
- `.env` - Environment variables (Amap API key)

### Key Components

**Dual Map Services**:
- Amap API for China (requires `VITE_AMAP_KEY` in `.env`)
- Photon API (OpenStreetMap) for global locations
- User can switch between services via tabs

**Navigation System**:
- Uses browser Geolocation API (falls back to Apple Park coordinates)
- Calculates bearing and distance using Haversine formula
- Updates every 2 seconds during navigation
- Displays 8-direction arrows (↑ ↗ → ↘ ↓ ↙ ← ↖) based on bearing

**G2 Display Modes**:
1. **Welcome Page**: Title + intro text + app icon (70×70 PNG)
2. **Navigation Page**: Arrow icon (28×28) + distance text + stoic quote

**Navigation History**:
- Stores last 20 destinations in localStorage
- Displayed when search input is empty
- Persists across sessions

**Stoic Quotes**:
- Fetched from https://stoic-quotes.com/api/quote
- Updates every 10 minutes during navigation
- Retry logic: attempts every 5 seconds on failure

### G2 SDK Integration

**Bridge Initialization**:
- Uses `waitForEvenAppBridge()` from SDK
- Listens for device connection status changes
- Creates initial page on first connection

**Page Management**:
- `createStartUpPageContainer()` - Creates initial welcome page
- `rebuildPageContainer()` - Switches between welcome/navigation modes
- `textContainerUpgrade()` - Updates text content (distance, quotes)
- `updateImageRawData()` - Updates images (icons, arrows)

**Container IDs**:
- Welcome: 1001 (title), 1002 (intro), 1003 (icon)
- Navigation: 1001 (arrow image), 1002 (distance text), 1003 (quote text)

**Event Handling**:
- Double-click on glasses toggles navigation on/off

### Design System

**Typography**: FK Grotesk Neue (Light 300, Regular 400)
- Very Large Title: 24px / 31px / -0.72px / 400
- Large Title: 20px / 26px / -0.6px / 400
- Medium Title: 17px / 22px / -0.17px / 400
- Normal Title: 15px / 19px / -0.15px / 400

**Colors**: CSS variables in `src/styles.css`
- Text: `--text-first` (#232323), `--text-second` (#7B7B7B), `--text-success` (#4BB956)
- Backgrounds: `--bg-first` through `--bg-fourth`, `--bg-accent` (#FEF991)

**Grid**: 8px base unit, 48px container padding, 6px border radius

## G2 Display Specifications

**Canvas Size**: 520×280 pixels (green Micro-LED)

**Welcome Page Layout**:
- Title: x=20, y=20, w=350, h=80
- Intro: x=20, y=80, w=350, h=150
- Icon: x=430, y=90, w=70, h=70

**Navigation Page Layout**:
- Arrow: x=20, y=20, w=28, h=28 (image container)
- Distance: x=72, y=20, w=330, h=80 (text)
- Quote: x=20, y=220, w=480, h=60 (text)

**Icon Requirements**:
- Must be white for G2 display (black icons appear too dark)
- No background on icon containers (preserve transparency)
- Canvas size must match container size exactly
- Convert to PNG base64 before sending to SDK

## Environment Variables

Create `.env` file in project root:
```
VITE_AMAP_KEY=bd8561ed37a197fd71fea790560289dc
```

## Knowledge Base

Comprehensive G2 development documentation is available at:
`/Users/zijiechen/Library/Mobile Documents/com~apple~CloudDocs/AI/even-g2-dev/KNOWLEDGE_BASE.md`

Refer to this for:
- Complete SDK API reference
- Container system details
- Hardware specifications
- Design guidelines
- Code templates
