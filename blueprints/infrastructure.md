# Blueprint: Infrastructure

This module contains the Terraform configuration, CI/CD workflows, and execution strategy for the project.

### 1. Terraform: `providers.tf`
```hcl
terraform {
  required_version = ">= 1.0.0"
  required_providers { google = { source = "hashicorp/google"; version = "~> 6.0" } }
}
provider "google" { project = var.project_id; region = var.region }
```

### 2. Terraform: `main.tf` (WIF + SAs)
```hcl
resource "google_iam_workload_identity_pool" "github_pool" {
  project = var.project_id
  workload_identity_pool_id = "github-pool"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  project = var.project_id
  workload_identity_pool_id = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-deploy-provider"
  attribute_mapping = { "google.subject" = "assertion.sub", "attribute.repository" = "assertion.repository" }
  attribute_condition = "assertion.repository == '${var.github_repo}'"
  oidc { issuer_uri = "https://token.actions.githubusercontent.com" }
}

resource "google_service_account" "server_sa" {
  project = var.project_id
  account_id = "${app}-server"
}

resource "google_project_iam_member" "server_roles" {
  for_each = toset(["roles/datastore.user", "roles/cloudtrace.agent", "roles/secretmanager.secretAccessor"])
  project = var.project_id
  role = each.key
  member = "serviceAccount:${google_service_account.server_sa.email}"
}

resource "google_service_account_iam_member" "wif_user" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/github-deployer@${var.project_id}.iam.gserviceaccount.com"
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${var.github_repo}"
}
```

### 3. Terraform: `main.tf` (Cloud Run & Direct Access)
```hcl
resource "google_cloud_run_v2_service" "server" {
  name     = "${app}-server"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.server_sa.email
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"
      env { name = "NODE_ENV", value = "production" }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  name   = google_cloud_run_v2_service.server.name
  role   = "roles/run.invoker"
  member = "allUsers"
}

output "server_url" {
  value = google_cloud_run_v2_service.server.uri
}
```

### 4. Terraform: `main.tf` (Artifact Registry Cleanup)
```hcl
resource "google_artifact_registry_repository" "gcr" {
  project       = var.project_id
  location      = "us"
  repository_id = "gcr.io"
  format        = "DOCKER"

  cleanup_policy_dry_run = false

  cleanup_policies {
    id     = "keep-recent-2"
    action = "KEEP"
    most_recent_versions { keep_count = 2 }
  }

  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"
    condition { older_than = "604800s" } # 7 days
  }
}
```

### 5. Terraform: `backend.tf`
```hcl
terraform {
  backend "gcs" {
    bucket = "${app}-tfstate"
    prefix = "terraform/state"
  }
}
```

### 6. Terraform: `variables.tf`
```hcl
variable "project_id" { type = string }
variable "region" { type = string; default = "us-central1" }
variable "environment" { type = string }
variable "github_repo" { type = string }
variable "billing_account" { type = string }
variable "alert_email" { type = string }
```

### 7. Root: `firebase.json`
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "web/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": { "serviceId": "${app}-server", "region": "us-central1" }
      },
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

### 8. Root: `firestore.rules`
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{docId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false;
    }
  }
}
```

### 9. CI/CD: `.github/workflows/deploy.yml`
```yaml
name: CI/CD Pipeline
on:
  push: { branches: [ main ] }
  pull_request: { branches: [ main ] }
permissions: { contents: read, id-token: write }

jobs:
  test-server:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: '24' }
    - run: cd server && npm ci && npm run lint && npm test

  test-web:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: '24' }
    - run: cd web && npm ci && npm run lint && npm test

  deploy-staging:
    needs: [test-server, test-web]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - uses: actions/checkout@v4
    - uses: google-github-actions/auth@v2
      with:
        workload_identity_provider: ${{ secrets.WIF_PROVIDER_STAGING }}
        service_account: ${{ secrets.WIF_SERVICE_ACCOUNT_STAGING }}
    - name: Terraform
      run: |
        cd terraform
        terraform init
        terraform apply -var-file=environments/staging.tfvars -auto-approve
    - name: Deploy
      run: |
        gcloud builds submit . --config cloudbuild.yaml
        gcloud run deploy ${app}-server --image gcr.io/$PROJECT_ID/server
```

### 10. Root: `package.json` (Workspaces)
```json
{
  "name": "${app}-root",
  "private": true,
  "workspaces": ["server", "web", "shared"],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace server\" \"npm run dev --workspace web\"",
    "test": "npm test --workspaces"
  },
  "devDependencies": {
    "concurrently": "^9.1.2",
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0",
    "zod": "^4.3.6"
  }
}
```

### VII. EXECUTION STRATEGY
1.  **Workspaces**: Run `npm install` at root to resolve all dependencies.
2.  **OTel**: Ensure `startTracing()` is Line 1 of `server/src/index.ts`.
3.  **Proxying**: Use `firebase.json` rewrites for `/api`.
4.  **AR Import**: After the first push, run `terraform import google_artifact_registry_repository.gcr projects/<PROJECT_ID>/locations/us/repositories/gcr.io`.
5.  **Consistency**: Before deploying, run `npm test` at the root.
