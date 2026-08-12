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

Push to `main` (or run the Deploy workflow from `main` only) builds and pushes `ghcr.io/<owner>/wishlist:latest` and `:sha-<commit>`, then triggers Coolify via webhook.

Required GitHub Actions secrets: `COOLIFY_WEBHOOK`, `COOLIFY_TOKEN`. Configure application runtime environment in Coolify (not in this workflow), including a persistent volume mounted at `/data` and `SQLITE_PATH=/data/wishlist.db`.
