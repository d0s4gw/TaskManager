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
    "sts.googleapis.com",
    "billingbudgets.googleapis.com",
    "monitoring.googleapis.com",
    "compute.googleapis.com"
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

moved {
  from = google_iam_workload_identity_pool.github_pool[0]
  to   = google_iam_workload_identity_pool.github_pool
}

moved {
  from = google_iam_workload_identity_pool_provider.github_provider[0]
  to   = google_iam_workload_identity_pool_provider.github_provider
}

moved {
  from = google_service_account_iam_member.wif_user[0]
  to   = google_service_account_iam_member.wif_user
}

resource "google_iam_workload_identity_pool" "github_pool" {
  project                   = var.project_id
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Pool"
  description               = "Identity pool for GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-deploy-provider"
  display_name                       = "GitHub Provider"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository == '${var.github_repo}'"

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
    "roles/secretmanager.admin",              # To manage secrets
    "roles/datastore.owner",                  # To manage Firestore and indexes
    "roles/serviceusage.serviceUsageAdmin",   # To manage APIs
    "roles/iam.workloadIdentityPoolAdmin",    # To manage WIF
    "roles/resourcemanager.projectIamAdmin",  # To manage Project IAM
    "roles/iam.serviceAccountAdmin",          # To manage Service Account IAM
    "roles/cloudbuild.builds.editor",         # To check build status
    "roles/cloudbuild.builds.viewer",         # To view build details
    "roles/logging.viewer",                   # To stream build logs
    "roles/viewer",                           # Primitive viewer role for gcloud compatibility
    "roles/firebasehosting.admin",            # To deploy web tier
    "roles/firebase.developAdmin",            # For general firebase management
    "roles/monitoring.editor",                # To create and manage dashboards
    "roles/compute.admin",                    # Full compute access (NEGs, Load Balancers, Cloud Armor)
    "roles/serviceusage.serviceUsageConsumer" # For API enablement checks
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:github-deployer@${var.project_id}.iam.gserviceaccount.com"
}

# 6.5 IAM Propagation Wait
resource "time_sleep" "iam_wait" {
  depends_on      = [google_project_iam_member.deployer_roles]
  create_duration = "60s"
}

# 7. Cloud Run Service
resource "google_cloud_run_v2_service" "server" {
  name                = "task-manager-server"
  location            = var.region
  project             = var.project_id
  deletion_protection = false

  template {
    service_account = google_service_account.server_sa.email

    scaling {
      min_instance_count = var.environment == "prod" ? 1 : 0
      max_instance_count = 10
    }

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder for initial bootstrap

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

  depends_on = [
    google_project_service.services,
    time_sleep.iam_wait
  ]

  ingress = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
}

# 8. Load Balancer & Cloud Armor
resource "google_compute_security_policy" "cloud_armor" {
  project     = var.project_id
  name        = "task-manager-armor"
  description = "Cloud Armor policy for TaskManager"

  depends_on = [time_sleep.iam_wait]

  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }

  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "SQL Injection protection"
  }

  rule {
    action   = "deny(403)"
    priority = "1001"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "XSS protection"
  }
}

resource "google_compute_region_network_endpoint_group" "server_neg" {
  project               = var.project_id
  name                  = "server-neg"
  region                = var.region
  network_endpoint_type = "SERVERLESS"
  cloud_run {
    service = google_cloud_run_v2_service.server.name
  }

  depends_on = [time_sleep.iam_wait]
}

resource "google_compute_backend_service" "server_backend" {
  project               = var.project_id
  name                  = "server-backend"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  security_policy       = google_compute_security_policy.cloud_armor.id

  backend {
    group = google_compute_region_network_endpoint_group.server_neg.id
  }
}

resource "google_compute_url_map" "lb_url_map" {
  project         = var.project_id
  name            = "task-manager-url-map"
  default_service = google_compute_backend_service.server_backend.id
}

resource "google_compute_target_http_proxy" "http_proxy" {
  project = var.project_id
  name    = "task-manager-proxy"
  url_map = google_compute_url_map.lb_url_map.id
}

resource "google_compute_global_forwarding_rule" "http_rule" {
  project               = var.project_id
  name                  = "task-manager-forwarding-rule"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "80"
  target                = google_compute_target_http_proxy.http_proxy.id
}

# 9. Firestore Composite Indexes

resource "google_firestore_index" "task_user_date" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "tasks"

  fields {
    field_path = "userId"
    order      = "ASCENDING"
  }

  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }
}

# 9. Workload Identity User Binding
resource "google_service_account_iam_member" "wif_user" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/github-deployer@${var.project_id}.iam.gserviceaccount.com"
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${var.github_repo}"
}

# 10. WIF Token Creator (Zero-403 Protocol)
resource "google_service_account_iam_member" "wif_token_creator" {
  service_account_id = google_service_account.server_sa.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${var.github_repo}"
}

# 11. Allow Unauthenticated Access
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.server.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 12. Budget Alerts
resource "google_billing_budget" "budget" {
  billing_account = var.billing_account
  display_name    = "TaskManager Budget (${var.environment})"

  depends_on = [google_project_service.services]

  budget_filter {
    projects = ["projects/${data.google_project.project.number}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = "10" # $10 limit for safety
    }
  }

  threshold_rules {
    threshold_percent = 0.5
  }
  threshold_rules {
    threshold_percent = 0.9
  }
  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "FORECASTED_SPEND"
  }
}

# 13. Monitoring Dashboard
resource "google_monitoring_dashboard" "dashboard" {
  project = var.project_id
  depends_on = [
    google_project_service.services,
    time_sleep.iam_wait
  ]
  dashboard_json = <<EOF
{
  "displayName": "TaskManager Health (${var.environment})",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Cloud Run Request Count",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_revision\" metric.type=\"run.googleapis.com/request_count\" resource.labels.service_name=\"${google_cloud_run_v2_service.server.name}\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              },
              "plotType": "LINE"
            }
          ]
        }
      },
      {
        "title": "Cloud Run Latency (ms)",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_revision\" metric.type=\"run.googleapis.com/request_latencies\" resource.labels.service_name=\"${google_cloud_run_v2_service.server.name}\"",
                  "aggregation": {
                    "perSeriesAligner": "ALIGN_DELTA"
                  }
                }
              },
              "plotType": "LINE"
            }
          ]
        }
      }
    ]
  }
}
EOF
}

