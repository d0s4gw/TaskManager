output "project_id" {
  value = var.project_id
}

output "firestore_name" {
  value = google_firestore_database.database.name
}

output "wif_pool_id" {
  value = google_iam_workload_identity_pool.github_pool.id
}
