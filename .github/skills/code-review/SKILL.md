---
name: code-review
description: Review pull requests against this app's import-alias, app-kit consumption, and Next.js App Router conventions. Use for any PR touching src/.
---

# hear-the-music-tree-frontend code review

Next.js App Router app consuming `@behindthemusictree/app-kit`,
`@behindthemusictree/genre-tree-view`, and `@behindthemusictree/brand`. Review
PRs against the rules below in addition to general correctness.

## app-kit consumption (blocking)

- Only import from the published subpath exports of `@behindthemusictree/app-kit`
  (e.g. `@behindthemusictree/app-kit/genre-tree`) — never deep-import into its
  `dist` or source internals.
- App-specific behavior (data hooks, routes, popups) belongs in this repo and
  should be passed into app-kit components via the props/callbacks they expose
  (e.g. `PlayerProvider`'s `loadTrack`, `AuthCallbackHandler`'s callback
  props), not recreated by reaching into app-kit internals.
- Flag any PR that copies logic already available from app-kit instead of
  importing it.

## Import aliases (blocking)

- Never use deep relative paths (`../../../`) — use the configured aliases:
  `@app/*`, `@components/*`, `@hooks/*`, `@lib/*`, `@utils/*`,
  `@constants/*`, `@app-types/*`, `@schemas/*`, `@domain/*`, `@api/*`,
  `@assets/*`, `@contexts/*` (see `tsconfig.json`).
- New files should land in the matching `src/` subfolder for the alias they'll
  be imported through, not loose under `src/`.

## General (blocking)

- TypeScript strict mode: flag new `any` without a justification comment.
- No `console.log` left in production code paths.
- Prefer existing utilities in `src/lib` or `src/hooks` over introducing
  duplicate helpers.
- Don't flag missing abstractions, refactors, or features beyond the PR's
  stated scope — this repo avoids unrequested cleanup.
