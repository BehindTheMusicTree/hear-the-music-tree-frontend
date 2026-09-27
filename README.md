# Hear the Music Tree

A cloud-based audio file manager for collectors, DJs, curators, and listeners —
browse a genre tree, manage genre-based playlists, and manage your uploaded audio
library, all with an in-app player.

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router) + React 19 + TypeScript
- Tailwind CSS
- TanStack Query for server state
- Zod for schema validation
- D3 (via `@behindthemusictree/genre-tree-view` and player/library visualizations)
- Sentry for error/performance monitoring
- Internal `@behindthemusictree/*` packages: `app-kit` (shared providers/hooks/transport),
  `brand` (design tokens/CSS/favicons), `genre-tree-view`, `ui`

## Prerequisites

- Node 20+ (Node 22 is used for the Docker build)
- [pnpm](https://pnpm.io/) 10.33.2 (via `corepack enable`)
- Read access to the `@behindthemusictree` scope on GitHub Packages — set an
  `NPM_TOKEN`/`GH_PACKAGES_TOKEN_READ` env var per `.npmrc` before installing

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in the required values, see below
pnpm dev
```

By default the app runs on `http://127.0.0.1:3000`. The `PORT` var in
`.env.local` is *not* picked up automatically by `next dev` (Next only reads
`.env*` files after the server has already bound its port) — to actually use
it, export it as a shell env var, e.g. `PORT=9003 pnpm dev`.

## Environment variables

See `.env.example` for the full, annotated list. Key points:

- `next.config.js` **fails the build** if any of `REQUIRED_ENV_VARS` (contact email,
  Spotify client ID/scopes/redirect URI, Google client ID/redirect URI, upload timeout)
  is missing, along with either `NEXT_PUBLIC_BACKEND_BASE_URL` or
  `NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT`.
- Spotify and Google OAuth each need a client ID registered with the respective
  provider, with a redirect URI matching `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` /
  `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`.
- Sentry is opt-in locally via `NEXT_PUBLIC_SENTRY_IS_ACTIVE`.

## Available scripts

| Script                 | Purpose                                      |
| ----------------------- | --------------------------------------------- |
| `pnpm dev`              | Start the dev server (Turbopack)              |
| `pnpm build`             | Production build                              |
| `pnpm build:debug`       | Build with `NODE_ENV=development`             |
| `pnpm start`             | Run the production build                      |
| `pnpm lint`              | ESLint (flat config)                          |
| `pnpm test`              | Run tests once (Vitest)                       |
| `pnpm test:watch`        | Run tests in watch mode                       |
| `pnpm test:ui`           | Vitest UI                                     |
| `pnpm test:coverage`     | Run tests with coverage                       |

## Testing

Vitest + `happy-dom` + React Testing Library (`vitest.setup.ts`). Coverage is
enforced at **85%** for lines/functions/branches/statements (`vitest.config.ts`) —
CI runs `pnpm test:coverage` on every PR. Path aliases `@hooks`, `@app-types`,
`@components`, `@lib` are available in tests.

## Architecture

Client-only Next.js app (no API routes) talking to an external BTMT backend API,
Spotify, Google, and Sentry. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for
the route map, API/schema layers, and how the app-kit providers fit together.

## Deployment

- **Docker**: multi-stage `Dockerfile`, builder on `node:22-alpine` (pnpm via
  corepack), requires the `GH_PACKAGES_TOKEN_READ` BuildKit secret plus
  `NEXT_PUBLIC_*` build args (see `REQUIRED_ENV_VARS` above). Runner stage uses
  `output: "standalone"`, runs as a non-root user, exposes port 3000.
- **Production**: deploys from `main` via Vercel auto-deploy on push (no
  `vercel.json` in this repo — configured on Vercel directly).

## Contributing

This repo follows strict git flow: branch off `develop`, PR into `develop`;
`main` only receives `release/*`/`hotfix/*` merges. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the full branching and release process.
