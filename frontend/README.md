# TaskManager Frontend

A React Single Page Application (SPA) built with Vite, secured with Firebase Authentication.

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Authentication**: Firebase Client SDK
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library

## Setup
1. `npm install`
2. Create a `.env` file with your `VITE_FIREBASE_*` credentials.
3. `npm run dev`

## Scripts
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles for production (output to `dist/`).
- `npm test`: Runs the Vitest test suite.

## Development Notes
- **Authentication**: Uses `onAuthStateChanged` in `App.jsx` to manage user state.
- **API Proxy**: Local development proxies `/api` to `http://localhost:3001`. In production, this is handled via **Firebase Hosting** rewrites.
