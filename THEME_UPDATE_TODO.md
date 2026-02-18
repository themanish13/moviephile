# Theme Update TODO

## Overview
Update the app's color scheme from gold/amber to Electric Purple & Aqua Blue accents while keeping the dark charcoal background.

## Tasks

### Step 1: Update tailwind.config.ts ✅
- [x] Add electric-purple and aqua-blue color definitions
- [x] Update primary color to Electric Purple
- [x] Add accent color as Aqua Blue
- [x] Update neon glow utilities for new colors
- [x] Update keyframes for purple/blue glow effects

### Step 2: Update src/index.css ✅
- [x] Change --background to deep charcoal black
- [x] Change --primary to Electric Purple (280, 100%, 60%)
- [x] Change --accent to Aqua Blue (190, 100%, 50%)
- [x] Update --foreground to off-white
- [x] Replace gold-related utilities with purple/blue equivalents
- [x] Update glow effects (neon-purple, neon-blue)

### Step 3: Update src/components/ui/button.tsx ✅
- [x] Add purple variant: Electric Purple styling
- [x] Add blue variant: Aqua Blue styling
- [x] Add purple-ghost and blue-ghost variants
- [x] Keep gold variant for backwards compatibility

### Step 4: Update Component Styles ✅
- [x] Update Layout nav buttons from gold to purple
- [x] Update MovieCard save button glow effects
- [x] Update Watch page filter buttons
- [x] Update MovieDetail action buttons
- [x] Update Watchlist filter buttons
- [x] Update Profile page buttons
- [x] Update MobileLayout components

## Color Palette
- Background: Deep Charcoal Black (#0A0A0F)
- Foreground: Off-White (#F5F5F7)
- Primary: Electric Purple (280°, 100%, 60%)
- Accent: Aqua Blue (190°, 100%, 50%)

