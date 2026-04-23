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
1. **Tests**: Automated unit tests run for both `/server` (Jest) and `/web` (Vitest) on every pull request and push to `main`.
2. **Terraform**: Synchronizes infrastructure (APIs, IAM, Cloud Run service definitions).
3. **Cloud Build**: Multi-stage build using `cloudbuild.yaml` to handle root build context and shared types.
4. **Firebase Hosting**: Deploys the Web Tier (Next.js).

## Testing Strategy
- **Logic Tier**: Jest-based unit and integration tests with ~90% coverage target. Mocks Firestore and Auth for hermetic testing.
- **Web Tier**: Vitest and React Testing Library for component-level verification.
- **Shared**: Type safety enforced across the full stack via shared interfaces.
