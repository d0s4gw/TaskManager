terraform {
  backend "gcs" {
    bucket = "task-manager-tf-state-494203"
    prefix = "terraform/state"
  }
}
