---
name: launch
description: Use this skill when asked to run, start, dev-serve, or preview hear-the-music-tree-frontend, or to confirm a change works in the real app. Covers required env vars and the external BTMT backend API this client-only app talks to.
---

# Launch hear-the-music-tree-frontend

Client-only Next.js app (no API routes) — it talks to an external BTMT backend
API plus Spotify, Google, and Sentry. The build fails outright if required env
vars are missing, so env setup always comes before `pnpm dev`.

## 1. Install

```bash
pnpm install
```

Requires read access to the `@behindthemusictree` GitHub Packages scope — an
`NPM_TOKEN`/`GH_PACKAGES_TOKEN_READ` env var must be set per `.npmrc` first.

## 2. Env setup (first run, or after `.env.example` changes)

```bash
cp .env.example .env.local   # then fill in the required values
```

`next.config.js` fails the build if any `REQUIRED_ENV_VARS` are missing:
contact email, Spotify client ID/scopes/redirect URI, Google client
ID/redirect URI, upload timeout — plus either `NEXT_PUBLIC_BACKEND_BASE_URL`
or `NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT`. See `.env.example` for the full,
annotated list. Spotify/Google OAuth each need a registered client ID whose
redirect URI matches `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` /
`NEXT_PUBLIC_GOOGLE_REDIRECT_URI`. Sentry is opt-in locally via
`NEXT_PUBLIC_SENTRY_IS_ACTIVE`.

## 3. Start the dev server

```bash
pnpm dev
```

Defaults to `http://127.0.0.1:3000`. The `PORT` var in `.env.local` is **not**
picked up automatically — Next only reads `.env*` files after it has already
bound its port. To use a different port, export it as a shell var instead:

```bash
PORT=9003 pnpm dev
```

## 4. Verify

Open the printed URL. If pages render but data is missing/erroring, check
`NEXT_PUBLIC_BACKEND_BASE_URL` (or `NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT`) in
`.env.local` before debugging further — this app has no backend of its own to
run locally.
