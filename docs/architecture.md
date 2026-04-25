# TaskManager Infrastructure Specification

## Environment Mapping
- **Staging**: `task-manager-staging-494203`
- **Production**: `task-manager-prod-494203`
- **Region**: `us-central1`

## Identity Layer (WIF)
- **Pool**: `github-pool`
- **Provider**: `github-deploy-provider`
- **Scope**: Restricted to repository `d0s4gw/TaskManager`.
- **Identity Bridge**: GitHub OIDC -> `github-deployer` Service Account.

## Service Accounts (Least Privilege)
- **`github-deployer`**: CI/CD identity. Granted administrative roles for Cloud Run, Storage, Artifact Registry, and IAM management.
- **`task-manager-server`**: Runtime identity for the Logic Tier. Granted `roles/datastore.user` and `roles/secretmanager.secretAccessor`.

## CI/CD Workflow
1. **Hardened Test Gate**: Server (Jest + ESLint), Web (Vitest + ESLint), E2E (Playwright), and Terraform (fmt + validate) run on every push to `main`. Deploy is blocked until all pass.
2. **Security & Audit**: `npm audit` is performed to catch high-severity vulnerabilities.
3. **Terraform**: Synchronizes infrastructure (APIs, IAM, Cloud Run service definitions).
3. **Cloud Build**: Multi-stage build using `cloudbuild.yaml` to handle root build context and shared types.
4. **Firebase Hosting**: Deploys the Web Tier (Next.js).

## Persistence Layer (Firestore)
- **Mode**: Native Mode.
- **Indexes**: Composite indexes are managed via Terraform.
  - Required: `tasks` collection - `userId` (ASC) + `createdAt` (DESC).
- **Access**: Restricted to the `task-manager-server` service account via IAM.

## Observability
- **Logging**: Both Server and Web use a structured JSON logger for parity with Google Cloud Logging. All `console.error/log` calls have been migrated to the structured logger.
- **Request-ID**: Every inbound request is assigned a unique ID via `X-Request-ID` header propagation or UUID generation. The ID is included in all log entries and echoed on responses for cross-service correlation.
- **Tracing**: Logic Tier is instrumented with OpenTelemetry (`@opentelemetry/sdk-node`) for request tracing.
- **Error Tracking**: Global error handlers in both tiers capture and log exceptions with full stack traces.

## Testing Strategy
- **Logic Tier**: Jest-based unit and integration tests with ~90% coverage.
- **Web Tier (Unit)**: Vitest for component logic and build integrity checks.
- **Web Tier (E2E)**: Playwright tests covering auth flows, CRUD lifecycle, and detail panel interactions. Uses mocked Firebase Auth (`window.__E2E_MOCK_USER__`) and an in-memory task API for full isolation.
- **Infrastructure**: Terraform `fmt -check` and `validate` run in CI on every push.
- **Shared**: Type safety and validation enforced across the full stack via shared interfaces and Zod schemas (`shared/validation.ts`).
- **Local Guardrails**: Husky pre-commit hooks enforce linting and formatting before every commit.
