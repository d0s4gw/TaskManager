# TaskManager Infrastructure (Terraform)

This directory contains the Terraform configuration for the TaskManager 3-tier stack on Google Cloud Platform.

## Architecture
- **State Management**: GCS Backend (`gs://task-manager-tf-state-494203`) with Workspace support.
- **Environment Strategy**: Single codebase using Terraform Workspaces (`staging`, `prod`).
- **Identity**: Workload Identity Federation (WIF) for secure GitHub Actions deployment.
- **Linting**: Formatting is enforced locally via Husky and in CI/CD via `terraform fmt -check`.

## Directory Structure
- `main.tf`: Core resource definitions (APIs, Firestore, Secret Manager, IAM).
- `variables.tf`: Variable definitions.
- `providers.tf`: Provider configuration.
- `backend.tf`: GCS remote backend configuration.
- `environments/`: Environment-specific variable files (`.tfvars`).
- `TODO.md`: Roadmap for application and CI/CD integration.

## Usage

### Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated.
- Terraform CLI (v1.0.0+) installed.

### Initializing a Workspace
```bash
terraform init
terraform workspace select staging # or prod
```

### Planning & Applying
```bash
# Staging
terraform plan -var-file=environments/staging.tfvars
terraform apply -var-file=environments/staging.tfvars

# Production
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

## Security Note
The `github-deployer` service account is scoped to specific roles required for Cloud Run, Artifact Registry, Firestore, and Firebase Hosting management. See `main.tf` for the full role list.

For a detailed history of design decisions, see [Architecture Decision Records (ADR)](../docs/adr/).
