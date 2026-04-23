<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## TaskManager Specifics
- **Proxy**: /api is proxied to Cloud Run.
- **Shared**: Use root /shared for types.
- **Auth**: Firebase App Check is enabled.
<!-- END:nextjs-agent-rules -->
