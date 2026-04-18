# TaskManager

A modern, full-stack task management application designed with a focus on high-contrast readability and minimal UI clutter.

## Architecture
This project is structured as a monorepo with two main directories:
- `/backend`: A Node.js + Express API backed by an SQLite database.
- `/frontend`: A React Single Page Application (SPA) built with Vite.

## Quick Start

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
```
*Note: The backend runs on `http://localhost:3001`.*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Note: The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend.*

## Testing
Both the frontend and backend are covered by comprehensive automated test suites.

**To run backend tests (Jest + Supertest):**
```bash
cd backend
npm test
```

**To run frontend tests (Vitest + React Testing Library):**
```bash
cd frontend
npm test
```
