<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## TaskManager Specifics
- **Proxy**: /api is proxied to Cloud Run.
- **Shared**: Use root /shared for types.
- **Auth**: Firebase App Check is enabled.
- **Automated Testing**: Append `?agentLogin=true` to the URL (e.g., `http://localhost:3000/?agentLogin=true`) to automatically authenticate as "Agent Gemini". This bypasses the Google Login requirement and enables full CRUD interaction with the API on localhost.
- **Shipping Guard**: If the user asks "Are these changes ready to ship?" or similar, you **MUST** run `npm test` (root) and `npm run test:e2e` (web) before responding.
<!-- END:nextjs-agent-rules -->
