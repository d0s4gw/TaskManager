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
- **`task-manager-server`**: Runtime identity for the Logic Tier. Granted `roles/datastore.user`, `roles/secretmanager.secretAccessor`, and `roles/cloudtrace.agent`.

## CI/CD Workflow
1. **Hardened Test Gate**: Server (Jest + ESLint), Web (Vitest + ESLint), E2E (Playwright), and Terraform (fmt + validate) run on every push to `main`. Deploy is blocked until all pass.
2. **Security & Audit**: `npm audit` is performed to catch high-severity vulnerabilities.
3. **Terraform**: Synchronizes infrastructure (APIs, IAM, Cloud Run service definitions).
4. **Direct Export**: The Cloud Run service URI is exported directly as `server_url`. The previous Load Balancer and Cloud Armor layers have been removed to simplify the staging architecture.
5. **Cloud Build**: Multi-stage build using `cloudbuild.yaml` with the project root as context to support **npm workspaces**.
6. **Firebase Hosting & Rules**: Deploys the Web Tier (Next.js) and Firestore security rules.

## Persistence Layer (Firestore)
- **Mode**: Native Mode.
- **Data Model**: Organized around **Workspaces**. Every user has a default "Personal Workspace," and can create/join additional shared workspaces.
- **Indexes**: Composite indexes are managed via Terraform and `firestore.indexes.json`.
  - Required: `tasks` collection - `workspaceId` (ASC) + `position` (ASC/DESC).
- **Access**: Restricted to the `task-manager-server` service account via IAM.

## Security & Governance
- **Global Rate Limiting**: Enforced at the application level (1000 requests / 15 min per IP) to prevent abuse.
- **Firebase App Check**: Mandatory for all front-channel requests in production. Verified in the backend `verifyToken` middleware.
- **Workspace Ownership**: Strict server-side validation ensures only workspace owners can perform destructive actions (e.g., deleting workspaces).
- **Membership Logic**: Users must be members of a workspace to access or modify its tasks, with the exception of the automatically-granted personal workspace.

## Observability
- **Logging**: Both Server and Web use a structured JSON logger for parity with Google Cloud Logging.
- **Request-ID**: Every inbound request is assigned a unique ID via `requestId` middleware. The ID is included in all log entries for cross-service correlation.
- **Tracing**: Logic Tier is instrumented with OpenTelemetry (`@opentelemetry/sdk-node`) and Cloud Trace for request tracing.

## Testing Strategy
- **Logic Tier**: Jest-based unit and integration tests with repository mocking.
- **Web Tier (Unit)**: Vitest for component logic and build integrity checks.
- **Web Tier (E2E)**: Playwright tests covering auth flows, Workspace lifecycle, and CRUD operations.
- **Infrastructure**: Terraform `fmt -check` and `validate` run in CI on every push.
