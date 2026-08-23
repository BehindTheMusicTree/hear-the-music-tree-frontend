# Contributing

## Branching model (git flow)

This repo follows strict git flow. Two long-lived branches:

- **`main`** — production. Always deployable, always tagged. Only receives merges
  from `release/*` and `hotfix/*` branches. Protected: no direct pushes.
- **`develop`** — integration branch and default branch. Always green (CI passing).
  All work branches off `develop` and merges back into `develop` via PR.

Short-lived branches:

| Branch      | Cut from  | Merges into        | Purpose                          |
| ----------- | --------- | ------------------- | --------------------------------- |
| `feature/*` | `develop` | `develop`           | New functionality                 |
| `fix/*`     | `develop` | `develop`           | Non-urgent bug fixes               |
| `chore/*`   | `develop` | `develop`           | Tooling, deps, refactors, docs    |
| `release/*` | `develop` | `main` **and** `develop` | Release stabilization (version bump, changelog, last-minute fixes only — no new features) |
| `hotfix/*`  | `main`    | `main` **and** `develop` | Urgent production fix that can't wait for the next release |

Delete branches after merge. Use squash merges for `feature`/`fix`/`chore` PRs to
keep `develop` history linear; use a merge commit for `release`/`hotfix` PRs into
`main` so the release tag has a clean parent.

Commit / PR title prefixes follow Conventional Commits, matching existing history:
`feat:`, `fix:`, `chore:`, `ci:`.

## Release flow

1. Cut `release/x.y.z` from `develop` once `develop` has everything intended for
   the release.
2. On the release branch: bump `version` in `package.json`, update the changelog
   if present, fix anything CI/QA turns up. No new features on a release branch —
   cut a follow-up `feature/*` into `develop` instead.
3. Open a PR `release/x.y.z` → `main`. CI (`Lint Code`, `Run Tests`, `Build Check`)
   must pass.
4. Merge the PR (merge commit, not squash) once approved.
5. Tag the resulting commit on `main` as `vX.Y.Z` and cut a GitHub Release from
   the tag with the changelog entry.
6. Merge `main` back into `develop` (or merge the release branch into `develop`)
   so `develop` picks up the version bump and any release-branch fixes.
7. Delete the release branch.
8. Production deploys off `main` (Vercel auto-deploys on push to `main`).

Hotfixes follow the same shape, but start from `main`: branch `hotfix/x.y.z`,
fix, PR into `main`, tag, then merge back into `develop`.

## Before opening a PR

- `pnpm lint` and `pnpm test:coverage` locally (or rely on CI — both run on every
  PR).
- Coverage thresholds (85% lines/functions/branches/statements, see
  `vitest.config.ts`) are enforced in CI; add tests for new code paths rather
  than lowering the threshold.
- Target `develop`, not `main`, unless you're on a `release/*` or `hotfix/*`
  branch.
