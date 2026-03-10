# MoonWalker

Minimalist AR navigation app designed for Even Realities G2 smart glasses.

简洁的 AR 漫步导航应用 - 为 Even Realities G2 智能眼镜设计

## Features

- **Minimalist Navigation**: Only direction arrows and distance displayed on glasses, no complex route maps
- **Wandering Experience**: Follow directions to explore freely and enjoy the journey
- **Dual Map Services**: Amap for China, Photon (OpenStreetMap) for global locations
- **Navigation History**: Automatically saves visited destinations with localStorage
- **Stoic Quotes**: Philosophical quotes displayed during navigation, updated every 10 minutes
- **Real-time Updates**: Direction and distance refreshed every 2 seconds
- **Safe Area Support**: iOS notch and gesture bar handling

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Amap API Key

Copy the environment template and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and replace with your actual key:

```env
VITE_AMAP_KEY=your_amap_key_here
```

Get your API key from: https://console.amap.com/

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test in Simulator

```bash
npm run simulator
```

### 5. Test on Real Device

```bash
npm run qr
```

Scan the QR code with Even App to load the application.

## Usage

1. **Phone**: Search for destination, select result, tap "Start Navigation"
2. **Glasses**: View direction arrow (↑ ↗ → ↘ ↓ ↙ ← ↖) and distance
3. **Interaction**: Double-click on glasses to toggle navigation
4. **Arrival**: Automatic "Arrived" notification within 50 meters

## Tech Stack

- Even Hub SDK 0.0.7
- Amap Web API / Photon API
- Vite
- Vanilla JavaScript
- FK Grotesk Neue font

## Project Structure

```
MoonWalker/
├── src/
│   ├── main.js              # Main application logic
│   ├── styles.css           # Design system & styles
│   └── design-system.js     # Design tokens
├── public/
│   ├── fonts/               # FK Grotesk Neue fonts
│   ├── arrow-icon.svg       # Navigation arrow icon
│   └── moonwalker-icon.png  # App icon
├── index.html               # Phone UI
├── app.json                 # EvenHub app config
├── .env.example             # Environment template
└── vite.config.js
```

## Display Specifications

### Welcome Page (Glasses)
- Title: x=20, y=20, 350×80
- Description: x=20, y=80, 350×150
- Icon: x=430, y=90, 70×70

### Navigation Page (Glasses)
- Arrow icon: x=20, y=20, 28×28
- Distance: x=72, y=20, 330×80
- Quote: x=20, y=220, 480×60

## Development Notes

- Glasses display resolution: 576×288 pixels
- Navigation update frequency: 2 seconds
- Arrival threshold: 50 meters
- Direction precision: 8 directions (45° intervals)
- **Important**: Icons must be white for proper display on glasses (black icons appear dim)
- **Important**: Always restart simulator after code changes

## Design System

- **Font**: FK Grotesk Neue (Light 300, Regular 400)
- **Colors**: CSS variables defined in `src/styles.css`
- **Spacing**: 8px grid system
- **Border Radius**: 6px standard

## License

MIT
