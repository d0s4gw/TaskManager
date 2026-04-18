# TaskManager Frontend

A React Single Page Application (SPA) built with Vite, focusing on a clean, responsive, and maximally readable interface.

## Features
- **Modern React**: Built with React 19 hooks and functional components.
- **Styling**: Vanilla CSS (`index.css`) designed for high contrast and spacing, avoiding CSS framework clutter.
- **Testing**: Vitest + React Testing Library for fast, DOM-based component testing.

## Scripts
- `npm run dev`: Starts the Vite development server with hot-module replacement.
- `npm run build`: Compiles the application for production.
- `npm test`: Runs the Vitest test suite.
- `npm run lint`: Runs ESLint.

## Development Notes
The Vite development server is configured to proxy all requests matching `/api` directly to `http://localhost:3001` to avoid CORS issues during local development.
