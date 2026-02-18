# Moviephile

A modern movie discovery and tracking application built with React, TypeScript, and Tailwind CSS.

## Features

- Browse and discover movies
- View detailed movie information
- Create and manage watchlists
- Track your favorite movies
- Watch trailers and videos

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router DOM
- TanStack React Query
- TMDB API for movie data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd moviephile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Other components
├── data/            # Mock data
├── hooks/           # Custom React hooks
├── lib/             # Utilities and API clients
├── pages/           # Page components
├── App.tsx          # Main App component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run preview` - Preview production build

## API

This project uses [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api) for movie data. You'll need to obtain an API key from TMDB and add it to your environment variables.

