# Wishlist

Personal wishlist at [wishlist.slavoyar.tech](https://wishlist.slavoyar.tech).

## Local development

```bash
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

## Stack

- Next.js 15 (App Router)
- SQLite + Drizzle ORM
- Tailwind + shadcn-style primitives
- Docker / GHCR → Coolify webhook deploy

## Deploy

- **Pull request** to `main`: lint + build only (no image push).
- **Push** to `main` (or manual run on that branch): lint + build, then push `ghcr.io/<owner>/wishlist:latest` and `:sha-<commit>`, then Coolify webhook.

Required GitHub Actions secrets: `COOLIFY_WEBHOOK`, `COOLIFY_TOKEN`. Configure application runtime environment in Coolify (not in this workflow), including a persistent volume mounted at `/data` and `SQLITE_PATH=/data/wishlist.db`. If Coolify should always pull, include `force=true` in the webhook URL secret.
