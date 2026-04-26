# Infrastructure (Terraform) Instructions

## 🛠 Essential Commands
- **Init**: `terraform init`
- **Switch Env**: `terraform workspace select staging` (or `prod`)
- **Plan**: `terraform plan -var-file=environments/$(terraform workspace show).tfvars`
- **Apply**: `terraform apply -var-file=environments/$(terraform workspace show).tfvars`
- **Format**: `terraform fmt`

## 🏗 Infrastructure Patterns
- **Workspaces**: Always verify the active workspace with `terraform workspace show` before any plan/apply.
- **Service Accounts**: Logic Tier uses `api-runtime-sa`. CI/CD uses `github-deployer`.
- **WIF**: Workload Identity Federation settings are in `main.tf`. Do not change the `attribute_condition` without verifying the GitHub repo name.

## ⚠️ Safety Rules
- **No Destroy**: Never run `terraform destroy` without explicit user confirmation.
- **Lint First**: You MUST run `terraform fmt` before finishing any infrastructure task.
- **Secret Access**: Use `google_secret_manager_secret_version` for sensitive data. Do not hardcode values in `.tfvars`.
