# Developer & AI Agent Notes

This file contains "institutional knowledge" and critical patterns for the TaskManager project. Read this before starting any major feature development.

## 🧠 Core Philosophy
- **Shared First**: All data structures and API response formats **must** be defined in the `/shared` directory.
- **Unified Validation**: Use Zod schemas in `shared/validation.ts` for both frontend forms and backend request parsing. Never define duplicate validation logic.
- **Security by Default**: Every new endpoint in `server/` must be wrapped with the Firebase Auth middleware. No unauthenticated data access is permitted except for `/health`.

## 🔐 Authentication & Security
- **JWT Handling**: The backend validates tokens using `firebase-admin`. Clients must send the `Authorization: Bearer <ID_TOKEN>` header.
- **App Check**: All front-channel requests are protected by Firebase App Check. If you encounter 401/403 errors in production but not in development, verify the App Check enforcement settings.
- **Secret Management**: Do not use `.env` files for production secrets. Use Google Secret Manager. The `terraform/` layer handles the provisioning of these secrets.

## 🚀 Deployment & CI/CD
- **Environment**: Node.js 24 is the project standard. All CI/CD pipelines, Dockerfiles, and local development should target Node 24.
- **Workflow**: We use GitHub Actions with **Workload Identity Federation (WIF)**. Use `npm ci` for all installations in CI/CD and Dockerfiles to ensure build stability.
- **Project Number**: The GCP Project Number is `1279412370`.
- **Promotion Path**: Code is pushed to `main`, which triggers the deploy workflow. The "Hardened Gate" (Lint, Audit, Test, E2E) must **all pass** before the deploy job runs. Production promotion is currently manual via Terraform.
- **Dockerfile**: Uses multi-stage build with `node:24-slim` and `npm ci` in both stages. Never use `npm install` in the Dockerfile.

## 📱 Mobile (Flutter) Patterns
- **Model Parity**: Dart models in `mobile/lib/models/` must manually track the `/shared` TypeScript interfaces. If you update a TS interface, you **must** update the corresponding Dart model.
- **State Management**: The project is currently set up for a service-based architecture. Use **Riverpod** for state management moving forward to ensure scalability.

## 🌐 Web (Next.js) Patterns
- **API Proxy**: Use the `/api` prefix for all backend calls. Firebase Hosting rewrites proxy these calls to the Cloud Run server.
- **Observability**: Use the structured `JSON` logger in `web/src/lib/logger.ts` for **all** logging. Do not use `console.error` or `console.log` in source files — the only exception is the build-time guard in `firebase.ts`.
- **Firebase Initialization**: Firebase is initialized with a "build-aware" pattern in `web/src/lib/firebase.ts` to prevent build-time crashes when environment variables are missing. `getAuth()` is wrapped in a try/catch to support E2E testing without real credentials.
- **E2E Testing**: Playwright tests use a `window.__E2E_MOCK_USER__` global to inject a mock Firebase user. The `AuthContext` checks for this global before calling `onAuthStateChanged`. When writing new E2E tests, import the custom `test` fixture from `e2e/fixtures/auth.fixture.ts` instead of `@playwright/test` to get an `authenticatedPage` with a pre-mocked user and API.
- **Page Object Model**: E2E selectors are encapsulated in Page Object classes under `e2e/pages/`. When adding new UI components, add `data-testid` attributes and update the corresponding Page Object.

## 🖥️ Server (Express) Patterns
- **Structured Logging**: Use `winston` via `src/logger.ts` for all logging. Do not use `console.error` or `console.log` — every log entry must be structured JSON for Cloud Logging.
- **Request-ID**: Every request is assigned a unique ID via the `src/middleware/request-id.ts` middleware. The ID is read from the `X-Request-ID` header (set by upstream proxies) or generated as a UUID. Include `requestId: req.requestId` in all log metadata.
- **Environment Config**: Do not hardcode project IDs or environment-specific values. Use `process.env.GOOGLE_CLOUD_PROJECT` (auto-set by Cloud Run, or from `.env` locally).

## 🚢 Shipping & Deployment
- **Shipping Guard**: Whenever the user asks "Are these changes ready to ship?", "Is this ready to deploy?", or similar, you **MUST** run all automated tests to verify stability:
  1. `npm test` from the root (runs server and web unit tests).
  2. `cd web && npm run test:e2e` (runs Playwright E2E tests).
- **Gatekeeping**: Do not confirm readiness unless **all** tests, linting, and security audits pass.
- **Local Guardrails**: The project uses Husky. If your commit is rejected, check the lint-staged output for style or formatting errors. Do not use `--no-verify`.

## 🛠 Local Development
- **Unified Stack**: Run `npm run dev` in the **root** directory to start both `server` and `web` simultaneously using `concurrently`.
- **Setup**: Run `./setup-local.sh` to install all dependencies across tiers and generate default `.env` files.
- **Backend**: Listens on port `8080`.
- **Frontend**: Listens on port `3000`. Next.js proxies `/api` to `localhost:8080`.
- **Auth Trapdoor**: In `development` mode, you can use the `?agentLogin=true` query parameter to auto-authenticate as "Agent Gemini". This bypasses the Google Login popup and is optimized for AI agent testing.
- **E2E Note**: E2E tests mock both Firebase Auth and the Task API at the network layer. No `.env.local` or running server is required for Playwright tests — it starts the Next.js dev server automatically.
