# TaskManager Monorepo Guide

## 🛠 Essential Commands
- **Dev Stack**: `npm run dev` (Starts Server:8080 & Web:3000)
- **Setup**: `./setup-local.sh`
- **Test All**: `npm test`
- **Test Web E2E**: `cd web && npm run test:e2e`
- **Lint**: `npm run lint --workspaces`

## 🏗 Architecture Patterns
- **Shared First**: Always define data models and Zod schemas in `shared/` before implementation.
- **Path Aliases**: Use `@shared/*` for imports in the server.
- **CommonJS Server**: The server uses `require()`. Do not use ESM `import` in `server/`.
- **Structured Logs**: Use `logger.info({ requestId, ... })`. Never use `console.log`.
- **Labels**: Tasks support up to 10 free-text labels. Use `LabelInput` for the UI and validate via `shared/validation.ts`.
- **Subtasks**: Recursive nesting via `subtasks?: Task[]`. Use `z.lazy()` in Zod. UI via `NestedTaskItem`.
- **Gamification**: Points/levels/streaks via `GamificationService`. Stats stored in `user_stats` collection, served via `/api/stats`.

## 🔐 Security & Testing
- **Auth Trapdoor**: Use `?agentLogin=true` for local web testing.
- **Auth Middleware**: Every new server route MUST use `verifyToken`.
- **App Check**: All production requests MUST include a valid Firebase App Check token.
- **Rate Limiting**: The server enforces a global limit of 1000 req / 15 min.
- **Shipping Guard**: Before confirming readiness to deploy, you **MUST** run the "Test All" and "Test Web E2E" commands.

## 📚 References
- **`blueprints/`**: Modular system blueprints (server, web, infra, shared).
- **`DEVELOPER_NOTES.md`**: Deep-dives on OTel, App Check, and Token Stewardship.
- **`scripts/generate-skeleton.js`**: Use for high-efficiency code exploration.

## 🏁 Token Stewardship & Checkpointing
- **Modular Load**: Only read the specific blueprint relevant to your task.
- **Skeletons First**: Use `npm run skeleton <path>` to understand a component's interface before reading full implementation.
- **Checkpointing**: Before ending a long session, create a `walkthrough.md` artifact. Start the next session by reading that artifact to reset history debt.
- **Artifacts**: Use artifacts for reports/audits to keep them out of the chat history context.
