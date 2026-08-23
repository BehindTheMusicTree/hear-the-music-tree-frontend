# Project instructions for Claude Code

See `README.md` for setup and `docs/ARCHITECTURE.md` for codebase structure
(routes, API/schema layers, app-kit usage) before making changes.

See `CONTRIBUTING.md` for the full branching model and release flow. Summary
for day-to-day work in this repo:

- Default/integration branch is `develop`, not `main`. Branch new work
  (`feature/*`, `fix/*`, `chore/*`) off `develop` and open PRs into `develop`.
- `main` only receives merges from `release/*` or `hotfix/*` branches — never
  branch feature work from `main` or target `main` directly unless you're
  explicitly doing a release or hotfix.
- CI (`.github/workflows/validate.yml`) runs Lint Code, Run Tests (with an
  85% coverage gate — see `vitest.config.ts`), and Build Check on PRs into
  both `main` and `develop`.
- Commit/PR prefixes: `feat:`, `fix:`, `chore:`, `ci:` (Conventional Commits).
