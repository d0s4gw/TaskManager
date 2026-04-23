# TaskManager Logic Tier (Server)

The Logic Tier is a Node.js + Express application built with TypeScript, serving as the core engine for the TaskManager project. It handles business logic, authentication, and persistence to Google Cloud Firestore.

## Core Technologies

- **Language**: TypeScript
- **Framework**: Express
- **Persistence**: Google Cloud Firestore (via `firebase-admin`)
- **Authentication**: Firebase Auth (ID Token verification)
- **Observability**: OpenTelemetry (Traces & Error Reporting)
- **Containerization**: Docker (optimized for Google Cloud Run)

## Directory Structure

- `src/index.ts`: Entry point and server initialization.
- `src/tracing.ts`: OpenTelemetry instrumentation setup.
- `src/middleware/`: Express middleware (e.g., Auth verification).
- `src/repositories/`: Firestore data access layer using the Repository Pattern.
- `dist/`: Compiled JavaScript output (generated on build).

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Build & Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## Architectural Context

- **[decisions.log](./decisions.log)**: Detailed history of architectural and technical choices.
- **[next_steps.txt](./next_steps.txt)**: Roadmap for future features and infrastructure tasks.

## Deployment

The server is designed for stateless deployment on **Google Cloud Run**. The multi-stage `Dockerfile` handles compilation and production optimization. Use the provisioned Terraform infrastructure in the `terraform/` directory for deployment.
