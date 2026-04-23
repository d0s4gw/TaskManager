# 1. Enable APIs
resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "firestore.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "sts.googleapis.com"
  ])
  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# 2. Firestore Database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.services]
}

# 3. Secret Manager
resource "google_secret_manager_secret" "starter" {
  project   = var.project_id
  secret_id = "starter"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "starter_v1" {
  secret      = google_secret_manager_secret.starter.id
  secret_data = "initial-secret-value"
}

# 4. Workload Identity Federation
data "google_project" "project" {
  project_id = var.project_id
}

resource "google_iam_workload_identity_pool" "github_pool" {
  count                     = var.environment == "staging" ? 1 : 0
  project                   = var.project_id
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Pool"
  description               = "Identity pool for GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  count                              = var.environment == "staging" ? 1 : 0
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool[0].workload_identity_pool_id
  workload_identity_pool_provider_id = "github-deploy-provider"
  display_name                       = "GitHub Provider"
  
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository == 'd0s4gw/TaskManager'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# 5. Cloud Run Service Account
resource "google_service_account" "server_sa" {
  project      = var.project_id
  account_id   = "task-manager-server"
  display_name = "Task Manager Server Service Account"
}

resource "google_project_iam_member" "server_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.server_sa.email}"
}

resource "google_project_iam_member" "server_tracing" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.server_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "server_secret_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.starter.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.server_sa.email}"
}

# 6. Service Account IAM (github-deployer) - Least Privilege
resource "google_project_iam_member" "deployer_roles" {
  for_each = toset([
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser",
    "roles/storage.admin", # For Terraform state
    "roles/browser",
    "roles/secretmanager.admin", # To manage secrets
    "roles/firestore.indexAdmin" # To manage indexes
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:github-deployer@task-manager-staging-494203.iam.gserviceaccount.com"
}

# 7. Cloud Run Service
resource "google_cloud_run_v2_service" "server" {
  name     = "task-manager-server"
  location = var.region
  project  = var.project_id

  template {
    service_account = google_service_account.server_sa.email
    
    scaling {
      min_instance_count = var.environment == "prod" ? 1 : 0
      max_instance_count = 10
    }

    containers {
      image = "gcr.io/${var.project_id}/server:latest" # Placeholder, updated via CI/CD
      
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [google_project_service.services]
}

# 8. Firestore Composite Index (Example)
resource "google_firestore_index" "task_status_date" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "tasks"

  fields {
    field_path = "status"
    order      = "ASCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }
}

# 9. Workload Identity User Binding
resource "google_service_account_iam_member" "wif_user" {
  count              = var.environment == "staging" ? 1 : 0
  service_account_id = "projects/task-manager-staging-494203/serviceAccounts/github-deployer@task-manager-staging-494203.iam.gserviceaccount.com"
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/github-pool/attribute.repository/d0s4gw/TaskManager"
}
