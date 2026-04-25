variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "The environment name (staging or prod)"
  type        = string
}

variable "github_repo" {
  description = "The GitHub repository in 'owner/repo' format"
  type        = string
}

variable "billing_account" {
  description = "The billing account ID for budget alerts"
  type        = string
}

variable "alert_email" {
  description = "The email address for monitoring alerts"
  type        = string
}

