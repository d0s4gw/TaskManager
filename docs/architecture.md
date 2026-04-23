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
1. **Terraform**: Synchronizes infrastructure (APIs, IAM, Cloud Run service definitions).
2. **Cloud Build**: Multi-stage build using `cloudbuild.yaml` to handle root build context and shared types.
3. **Firebase Hosting**: Deploys the Web Tier (Next.js static export).
