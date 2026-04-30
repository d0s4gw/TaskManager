# TaskManager Project Roadmap

This document outlines the high-level milestones and future direction of the TaskManager project. For tactical day-to-day tasks, see the `TODO.md` files in each tier.

## 🏁 Phase 1: Foundation (Completed)
- [x] 3-tier GCP Architecture (Shared, Server, Web).
- [x] npm Workspaces & Monorepo structure.
- [x] Infrastructure-as-Code via Terraform (Staging).
- [x] Shared Zod Validation & Type Safety.
- [x] Automated CI/CD Gating.

## 🚀 Phase 2: Feature Parity & Growth (In Progress)
- [x] **Predictive Input**: Implementation of inline ghost text for task creation.
- [x] **Documentation Audit**: Migration to Hub & Spoke model for ADRs and Roadmaps.
- [x] **Labels**: Adding metadata and free-text tagging to tasks.
- [x] **Multi-user Support**: Implementing RBAC and sharing invitations.
- [ ] **Recurring Tasks**: Logic for daily, weekly, and monthly task duplication.
- [x] **Subtasks**: Recursive nested checklist items and granular progress tracking with real-time UI synchronization.


## 🏆 Phase 3: Gamification & Engagement (Upcoming)
- [ ] **Gamification**: Implementation of streaks, points, and completion rewards to drive retention.
- [ ] **Productivity Analytics**: Visualizing completed tasks and efficiency trends.

## 📱 Phase 4: Mobile & Offline (Upcoming)
- [ ] **Mobile Parity**: Automate Dart model generation and bring Flutter app to feature parity with Web.
- [ ] **Offline Sync**: Implement robust local-first synchronization for both Web and Mobile.
- [ ] **Push Notifications**: Cross-platform alerting via Firebase Cloud Messaging.

## 🏢 Phase 5: Production Readiness (Upcoming)
- [ ] **Production Provisioning**: Provisioning the `prod` workspace in Terraform.
- [ ] **Security Hardening**: Global rate limiting refinement and App Check enforcement audits.
- [ ] **Multi-Region Failover**: Enabling global redundancy for the Logic Tier.

