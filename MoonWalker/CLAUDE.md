# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoonWalker is an AR navigation web app for Even Realities G2 smart glasses. It displays minimal navigation information (direction arrow + distance) on the glasses while the user walks to a destination.

**Tech Stack**: Vite + Vanilla JS + Even Hub SDK (@evenrealities/even_hub_sdk)

**Location**: This is part of the evenG2 multi-app monorepo at `/Users/zijiechen/Library/Mobile Documents/com~apple~CloudDocs/AI/even-g2-dev/evenG2/`

## Development Commands

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Package app for EvenHub Submission (.ehpk format)
evenhub pack app.json ./dist -o moonwalker.ehpk

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

### Single-File Monolith (`src/main.js`)
All application logic lives in `src/main.js` (~1700 lines), organized directly manipulating the DOM. There are no frameworks, no TypeScript, no linting, and no tests by design.
- **State**: Single mutable `state` object.
- **Persistence**: 6 settings saved to `localStorage` (Philosophy quotes, display position, content sources, quote duration, navigation history).
- **Navigation Loop**: A 2-second update loop calculates bearing via Haversine and sends updates to the G2.

### G2 Glasses Integration
The app communicates with the glasses through the **Even Hub SDK bridge**:
- G2 is a **privacy-first "dumb display"** — no on-board app execution. The web app runs on the phone.
- **Image handling**: Image updates (`updateImageRawData`) must be **serial**. Concurrent image pushes block the BLE channel.
- **Containers**: Pages are built from text + image containers with absolute positioning. Max 12 containers per page (up to 8 text + 4 image).
- **Double-click** on the glasses toggles navigation on/off.
- **Lifecycle**: `createStartUpPageContainer` must only be called **once** (at startup). All subsequent page changes use `rebuildPageContainer`. Call `shutDownPageContainer(0)` on exit.

### Map Services & Location
- Amap API for China (requires `VITE_AMAP_KEY` in `.env`)
- Photon API (OpenStreetMap) for global locations
- GPS location + Compass heading (iOS `webkitCompassHeading` / Android `alpha`)

## EvenHub Store Submission Requirements

**CRITICAL: Mandatory Version Requirements for Store Submission**
Even if newer versions exist, you MUST use exactly these versions for store approval:
- **SDK** (`@evenrealities/even_hub_sdk`): **v0.0.8**
- **CLI** (`@evenrealities/evenhub-cli`): **v0.1.10**
- **Simulator** (`@evenrealities/evenhub-simulator`): **v0.6.0**

**Submission Checklist Constraints:**
1. **App icon**: Must be drawn inside the developer portal on a **2×2 pixel grid** (monochrome).
2. **Screenshots**: Must be PNG format generated from Simulator v0.6.0.
3. **App Info**: Description max 2,000 chars. Need privacy/permission declarations generated in the portal.

## G2 Display Specifications

**Canvas Size**: 576×288 pixels (4-bit grayscale = 16 levels of green)

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

## Design System
- **Typography**: FK Grotesk Neue (Light 300, Regular 400). All letter-spacing values are negative.
- **Grid**: 8px base unit, 48px container padding, 6px border radius.
- Detailed specs in `src/design-system.js` and `styles.css`.

## Knowledge Base

Comprehensive G2 development documentation is available at:
`/Users/zijiechen/Library/Mobile Documents/com~apple~CloudDocs/AI/even-g2-dev/KNOWLEDGE_BASE.md`
