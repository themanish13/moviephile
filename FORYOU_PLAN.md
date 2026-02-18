# Plan: TikTok-style Home Page

## Goal
Transform the home page into a TikTok-style vertical reel experience with movie grid.

## Changes Needed

### 1. App.tsx
- Remove `/watch` route entirely
- Change `/foryou` to `/` (home page)
- Keep Index page as is but modify it

### 2. Index.tsx - Complete Rewrite
- Remove all existing sections (Hero banner, IMDb Top Rated, New Releases, Trending, Coming Soon, Popular)
- Add TikTok-style vertical scroll reel container (like ForYou page)
- Add "New Releases This Week" header with "Browse Movies" and "Watch Trailers" buttons at top
- Add movie grid section below the reels

### 3. ForYou.tsx
- Keep as is (will become the main home page with reels)

### 4. MovieCard.tsx
- May need updates to handle navigation changes

### 5. TrailerReel.tsx
- Update onWatch to navigate properly to movie details

## Implementation Steps
1. Update App.tsx routes
2. Rewrite Index.tsx with TikTok-style format + movie grid
3. Update navigation links throughout the app

