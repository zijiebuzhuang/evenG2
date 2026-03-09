# MoonWalker Design System

## Overview

MoonWalker follows a consistent design system inspired by WeReader, with clearly defined colors and typography scales.

## Colors

### Text Colors
- `--text-highlight`: `#FFFFFF` - White text for highlights
- `--text-first`: `#232323` - Dark and accent text
- `--text-second`: `#7B7B7B` - Gray text
- `--text-success`: `#4BB956` - Success text
- `--text-error`: `#F44336` - Error text

### Background Colors
- `--bg-highlight`: `#232323` - Dark text background
- `--bg-first`: `#FFFFFF` - White background
- `--bg-second`: `#F6F6F6` - White gray background
- `--bg-third`: `#EEEEEE` - Main gray background
- `--bg-fourth`: `#E4E4E4` - Dark gray background
- `--bg-accent`: `#FEF991` - Yellow background
- `--bg-input`: `rgba(35, 35, 35, 0.08)` - Input background (8% opacity)
- `--bg-input-focus`: `rgba(35, 35, 35, 0.12)` - Input focus background (12% opacity)

## Typography

### Font Family
```
"FK Grotesk Neue", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, "Helvetica Neue", Arial, sans-serif
```

### Typography Scale

| Name | Font Size | Line Height | Letter Spacing | Font Weight | Usage |
|------|-----------|-------------|----------------|-------------|-------|
| Very Large Title | 24px | 31px | -0.72px | 400 | Hero titles |
| Large Title | 20px | 26px | -0.6px | 400 | Section headers |
| Medium Title | 17px | 22px | -0.17px | 400 | Card titles, button labels |
| Medium Body | 17px | 22px | -0.17px | 300 | Large body text |
| Normal Title | 15px | 19px | -0.15px | 400 | List item titles |
| Normal Body | 15px | 19px | -0.15px | 300 | Body text |
| Normal Subtitle | 13px | 17px | -0.13px | 400 | Subtitles, labels |
| Normal Detail | 11px | 14px | -0.11px | 400 | Small details |

## Usage

### In CSS
All design tokens are available as CSS custom properties in `src/styles.css`:

```css
.my-element {
  color: var(--text-first);
  background: var(--bg-first);
  font-family: var(--font-stack);
}
```

### In JavaScript
Import the design system constants from `src/design-system.js`:

```javascript
import { COLORS, TYPOGRAPHY, FONT_FAMILY } from './design-system.js'

// Use colors
const textColor = COLORS.textFirst

// Use typography
const titleStyle = TYPOGRAPHY.mediumTitle
// { fontSize: 17, lineHeight: 22, letterSpacing: -0.17, fontWeight: 400 }
```

## Components

### Current Components
- **Header**: Uses Medium Title typography
- **Section Title**: Uses Normal Subtitle typography
- **Input Box**: Uses Normal Body typography
- **Result Name**: Uses Normal Title typography
- **Result Address**: Uses Normal Subtitle typography
- **Status Card Message**: Uses Normal Title typography
- **Navigation Button**: Uses Medium Title typography

## Grid System
- Base unit: 8px
- Container padding: 48px (6 units)
- Card padding: 16px (2 units)
- Gap between elements: 4px, 8px, 12px, 16px (multiples of 4)

## Border Radius
- Small: 5px (tabs, inputs)
- Medium: 6px (cards, buttons)

## Shadows
- Card shadow: `0px 4px 12px rgba(0, 0, 0, 0.12)`
- Tab shadow: `0px 1px 3px rgba(0, 0, 0, 0.1)`
