# @moto/contract

Shared API contract for the Moto platform: **Zod schemas → inferred TypeScript types**.
Consumed by both `moto-backend` (validates requests/responses against the schemas) and
`moto-client` (types its API calls), so the two repos stay in sync.

## Build
```bash
pnpm install   # `prepare` builds dist automatically
pnpm build
```

## How the other repos consume it
Until a private registry / GitHub Packages is set up, the consumers reference this repo by path:

```jsonc
// moto-backend/package.json and moto-client/package.json
"dependencies": { "@moto/contract": "file:../moto-contract" }
```

The `prepare` script ensures `dist/` is built on install. When you change a schema:
```bash
# in moto-contract
pnpm build
# in the consumer
pnpm install   # re-pulls the rebuilt dist
```

### Recommended next step (removes manual sync pain)
Publish to a registry and pin a version instead of `file:`:
- **GitHub Packages** (private, free) → `@moto/contract@^0.1.0`
- tag releases (`v0.1.0`) and bump the consumers.

## Versioning
Bump `version` on every breaking schema change so consumers pin intentionally.
