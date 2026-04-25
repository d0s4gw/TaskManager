# ADR 0014: Global Load Balancing

## Status
Accepted

## Context
Regional Load Balancers in GCP have limitations regarding Cloud Armor security policies and global distribution.

## Decision
Migrate from Regional to **Global External Application Load Balancer**.

## Rationale
- **Security**: Enables the use of Cloud Armor security policies which are not supported by the regional GA provider.
- **Performance**: Edge-based termination reduces latency for global users.
- **Flexibility**: Better integration with Cloud Run and multi-region backends.
