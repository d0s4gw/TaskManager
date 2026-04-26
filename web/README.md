# TaskManager - Web Surface

The web surface for TaskManager is a high-performance, minimalist dashboard built with Next.js. It serves as the primary desktop interface for managing workflows and project dependencies.

## 🚀 Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google Sign-In)
- **Security**: Firebase App Check
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Firebase Hosting + Cloud Run Proxy

## 🏗 Architecture
- **API Proxying**: All requests to `/api/**` are proxied via `firebase.json` to the backend running on Google Cloud Run. This avoids CORS issues and consolidates the API under the same origin.
- **Unified Validation**: Utilizes the centralized `/shared/validation.ts` Zod schemas for both form validation and API parity.
- **Shared Types**: Utilizes the centralized `/shared` directory for API response and data models, ensuring type safety between frontend and backend.

## 🛠 Features Implemented
- **Premium UI**: Custom-built dashboard with glassmorphism elements and dark mode support.
- **Login with Google**: Ready-to-connect UI for Google authentication.
- **App Check Protection**: Integrated security layer to protect backend tokens.
- **Drag-and-Drop**: Sortable task list powered by `@dnd-kit`.
- **E2E Test Suite**: 13 Playwright tests covering auth flows, full CRUD lifecycle, and detail panel interactions with mocked Firebase Auth.

## 🚦 Getting Started

### Prerequisites
- Node.js 24+
- Firebase CLI (`npm install -g firebase-tools`)
- Chromium for Playwright (`npx playwright install chromium`)

### Development
1. Install dependencies from the **project root**:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env.local`.
3. Run the development server (from root or web):
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

> [!TIP]
> **Agent Mode**: Append `?agentLogin=true` to the URL to automatically log in as a mock user for automated testing.

### Testing
```bash
# Unit tests (Vitest)
npm test

# E2E tests (headless Chromium)
npm run test:e2e

# E2E tests (interactive UI mode)
npm run test:e2e:ui
```

### E2E Test Architecture
- **Fixtures**: `e2e/fixtures/auth.fixture.ts` — provides `authenticatedPage` with mocked Firebase user + in-memory task API.
- **Page Objects**: `e2e/pages/` — `DashboardPage` and `TaskDetailPage` encapsulate selectors and interactions.
- **Tests**: `e2e/tests/` — `auth.spec.ts` (unauthenticated flows) and `task-crud.spec.ts` (full CRUD lifecycle).

## 📄 Documentation
- **[Architecture Decision Records (ADR)](../docs/adr/)**: Why we built it this way.
- **[TODO.md](./TODO.md)**: Immediate tasks for the next development session.

## 🤖 AI Guidance
For tier-specific conventions, commands, and safety rules, AI agents should refer to the [CLAUDE.md](./CLAUDE.md) file in this directory.
