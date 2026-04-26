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

## 🔐 Security & Testing
- **Auth Trapdoor**: Use `?agentLogin=true` for local web testing.
- **Auth Middleware**: Every new server route MUST use `verifyToken`.
- **Shipping Guard**: Before confirming readiness to deploy, you **MUST** run the "Test All" and "Test Web E2E" commands.

## 📚 References
- **`TEMPLATE_PROMPT.md`**: The definitive blueprint for the entire system architecture.
- **`DEVELOPER_NOTES.md`**: Deep-dives on OTel, App Check, and Project History.
- **`server/CLAUDE.md`**: Backend-specific patterns and repository rules.
- **`web/CLAUDE.md`**: Frontend-specific conventions and UI standards.
- **`mobile/CLAUDE.md`**: Flutter/Dart models and state management rules.
- **`shared/CLAUDE.md`**: Type-safety and "Source of Truth" protocols.
- **`terraform/CLAUDE.md`**: Infrastructure safety rules and workspace commands.
