# Project guidance

Hear is a client-only Next.js App Router application that connects to an external
Hear API. Read `README.md` for setup, `docs/ARCHITECTURE.md` for the application
structure, and `CONTRIBUTING.md` for branching and releases.

- Branch work from `develop` and target `develop`; `main` accepts release and
  hotfix PRs only. Follow the branch and merge rules in `CONTRIBUTING.md`.
- CI runs lint, type checking, tests with an 85% coverage threshold, and a build
  check on PRs to `develop` and `main`. The contributing guide allows relying on CI.
- Use Conventional Commit titles as documented in `CONTRIBUTING.md`.
- When reviewing changes in `src/`, also read `.github/skills/code-review/SKILL.md`
  for the app's import and shared-package conventions.
- For local setup and preview, use the project `launch` skill in
  `.agents/skills/launch/SKILL.md`. It is shared with Claude through
  `.claude/skills/launch`; edit the shared source rather than the link.
- For ownership across BTMT packages, consult the project documentation and
  relevant package sources before implementing shared UI changes.
