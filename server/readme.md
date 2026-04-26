# TaskManager Logic Tier (Server)

The Logic Tier is a Node.js + Express application built with TypeScript, serving as the core engine for the TaskManager project. It handles business logic, authentication, and persistence to Google Cloud Firestore.

## Core Technologies

- **Language**: TypeScript
- **Framework**: Express
- **Persistence**: Google Cloud Firestore (via `firebase-admin`)
- **Authentication**: Firebase Auth (ID Token verification)
- **Validation**: Shared Zod schemas (Unified Validation)
- **Observability**: OpenTelemetry (Traces & Error Reporting), Winston (Structured JSON Logging)
- **Quality Control**: ESLint (Flat Config), Jest (Unit & Integration Tests)
- **Containerization**: Docker (optimized for Google Cloud Run, `node:24-slim`, `npm ci --workspace`)
- **Monorepo**: Integrated via **npm workspaces** with `@shared` path aliasing.

## Directory Structure

- `src/index.ts`: Entry point and server initialization.
- `src/logger.ts`: Structured JSON logger (winston).
- `src/tracing.ts`: OpenTelemetry instrumentation setup.
- `src/middleware/auth.ts`: Firebase Auth token verification.
- `src/middleware/request-id.ts`: Request-ID propagation (reads `X-Request-ID` or generates UUID).
- `src/repositories/`: Firestore data access layer using the Repository Pattern.
- `src/routes/`: Express route handlers.
- `dist/`: Compiled JavaScript output (generated on build).

## Getting Started

### Development
The server requires `NODE_ENV=development` to enable authentication bypasses for local testing. It is recommended to start the server via the root directory's unified dev command:

```bash
# From the project root
npm run dev
```

Alternatively, to run the server standalone:
```bash
npm run dev
```

### Build & Production
The server uses **CommonJS** for production stability.
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## Architectural Context

- **[Architecture Decision Records (ADR)](../docs/adr/)**: Detailed history of architectural and technical choices.
- **[TODO.md](./TODO.md)**: Roadmap for future features and infrastructure tasks.

## Deployment

The server is designed for stateless deployment on **Google Cloud Run**. The multi-stage `Dockerfile` handles compilation and production optimization. Use the provisioned Terraform infrastructure in the `terraform/` directory for deployment.

## 🤖 AI Guidance
For tier-specific conventions, commands, and safety rules, AI agents should refer to the [CLAUDE.md](./CLAUDE.md) file in this directory.
