# ADR 0006: Firebase Security Architecture

## Status
Accepted

## Context
Need secure authentication and protection against unauthorized API access.

## Decision
1. Use **Firebase Auth** (Google Sign-In) for identity.
2. Enforce **Firebase App Check** (ReCaptcha v3) for all front-channel requests.
3. Use **Firestore Security Rules** to restrict direct database access.

## Rationale
- **Managed Identity**: Offloads password management and security to Google.
- **Anti-Abuse**: App Check ensures only our legitimate apps can call the backend.
