# ADR 0002: Logic Tier Framework (Node.js + Express)

## Status
Accepted

## Context
We need a robust, scalable backend to handle business logic and Firestore interactions.

## Decision
Standardize on **Node.js 24**, **Express**, and **TypeScript**.

## Rationale
- **Ecosystem**: Large community and library support.
- **Speed**: Optimized for cold-starts on Cloud Run.
- **Type Safety**: TypeScript provides catch-at-compile-time error detection.
