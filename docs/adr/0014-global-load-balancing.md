# ADR 0014: Global Load Balancing

## Status
Deprecated (2026-04-27)

## Context
Regional Load Balancers in GCP have limitations regarding Cloud Armor security policies and global distribution.

## Decision
Migrate from Regional to **Global External Application Load Balancer**.

## Rationale
- **Security**: Enables the use of Cloud Armor security policies which are not supported by the regional GA provider.
- **Performance**: Edge-based termination reduces latency for global users.
- **Flexibility**: Better integration with Cloud Run and multi-region backends.

## Deprecation Note
As of 2026-04-27, the Global Load Balancer and Cloud Armor layers have been removed to simplify the staging architecture and reduce operational costs. The application now uses direct Cloud Run ingress (`INGRESS_TRAFFIC_ALL`) and enforces security (Rate Limiting, App Check) at the Logic Tier.
