# TaskManager Project Roadmap

This document outlines the high-level milestones and future direction of the TaskManager project. For tactical day-to-day tasks, see the `TODO.md` files in each tier.

## 🏁 Phase 1: Foundation (Completed)
- [x] 3-tier GCP Architecture (Shared, Server, Web).
- [x] npm Workspaces & Monorepo structure.
- [x] Infrastructure-as-Code via Terraform (Staging).
- [x] Shared Zod Validation & Type Safety.
- [x] Automated CI/CD Gating.

## 🚀 Phase 2: Feature Parity & UX (In Progress)
- [x] **Predictive Input**: Implementation of inline ghost text for task creation.
- [x] **Documentation Audit**: Migration to Hub & Spoke model for ADRs and Roadmaps.
- [ ] **Labels & Attachments**: Adding metadata and file support to tasks.
- [x] **Multi-user Support**: Implementing RBAC and sharing invitations.

## 📱 Phase 3: Mobile & Offline (Upcoming)
- [ ] **Mobile Parity**: Automate Dart model generation and bring Flutter app to feature parity with Web.
- [ ] **Offline Sync**: Implement robust local-first synchronization for both Web and Mobile.
- [ ] **Push Notifications**: Cross-platform alerting via Firebase Cloud Messaging.

## 🏢 Phase 4: Production Readiness (Upcoming)
- [ ] **Production Provisioning**: Provisioning the `prod` workspace in Terraform.
- [ ] **Security Hardening**: Global rate limiting refinement and App Check enforcement audits.
- [ ] **Multi-Region Failover**: Enabling global redundancy for the Logic Tier.
