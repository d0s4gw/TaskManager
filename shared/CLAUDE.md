# Shared Tier (Source of Truth) Instructions

## 🛠 Shared Commands
- **Check Types**: `npx tsc --noEmit`
- **Format**: `npm run format` (if available, otherwise follow project style)

## 🏗 The "Source of Truth" Rules
- **No Side Effects**: This directory MUST NOT contain any executable logic or side effects. It is for **declarations and schemas only**.
- **Platform Agnostic**: Do not import any Node-specific (e.g., `fs`, `crypto`) or Browser-specific (e.g., `window`, `document`) APIs here.
- **Dependency Minimalism**: Keep dependencies to a absolute minimum (ideally only `zod`). 
- **Zod Patterns**: Use `z.infer<typeof schema>` to export types. Do not define manual interfaces for data that is already covered by a Zod schema.

## 🔄 Change Propagation
- **Protocol First**: If you are adding a new feature that involves data, you **MUST** update the schemas in this directory before touching the server or web code.
- **Impact Analysis**: When changing a file here, run a workspace-wide search for that type to ensure you haven't broken the contract between the server and the web.
