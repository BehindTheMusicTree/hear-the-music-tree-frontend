# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Bump `@behindthemusictree/app-kit` and `app-kit-ui` to 18.5.2 and `@behindthemusictree/brand` to 12.4.0: the player panel follows the shared right-column width.
- **One spacing system**: the `:root { font-size: 14px }` override is removed, so the app renders on the browser's default 16px root (about 14% larger). Tailwind uses the `@behindthemusictree/brand` preset. Bumps `@behindthemusictree/app-kit` and `app-kit-ui` to 18.3.0 and `@behindthemusictree/brand` to 12.2.0, which size everything in rem.
- Bump `@behindthemusictree/app-kit` and `app-kit-ui` to 18.0.0: songs without a YouTube video show a crossed-out YouTube icon instead of the "No video available" text, and the shared buttons no longer depend on a global `button` rule.
- The player's mute and track-list buttons declare their own padding and radius instead of inheriting them from the global `button` rule.
- Bump `@behindthemusictree/app-kit` and `app-kit-ui` to 17.1.1: genre counts are no longer inflated (genre-tree-view 4.0.0 treats `itemCount` as a subtree total).
- Bump `@behindthemusictree/app-kit` and `app-kit-ui` to 16.1.0 (segmented view-mode toggle, brand-token dark track sidebar) and remove the unused `trackListName` and `144` Tailwind keys.
- Genre tree artist search is turned off (`artistSearch={false}`): hear has no artist catalogue, so the search bar stays genre-only.
- Bump `@behindthemusictree/app-kit` and `app-kit-ui` to 16.0.0; the app supplies the "track"/"tracks" noun through `TrackNounProvider`.
- Bump `@behindthemusictree/app-kit` and `app-kit-ui` to 17.0.0 (song/track/recording unification: `RecordingDetailed` is now `SongDetailed`, the API client calls `library/songs`).

### Fixed

- Local `pnpm test` and `pnpm lint` no longer pick up code in `.claude/worktrees/` (which would load a second React copy and fail the worktree's tests).

### Security

- Bump `next` to 16.3.3, `sharp` to 0.35.4, `vitest` / `@vitest/ui` to 4.1.11; override `brace-expansion`, `js-yaml`, `undici` to patched versions.
- Add `.github/dependabot.yml` (security updates only, GitHub Packages registry).

### CI

- Added `pnpm typecheck` (`next typegen && tsc --noEmit`, test files included) and a required `Type Check` CI job
- Deploys: bumped `trigger-coolify-deploy` to v4.4.0 — a Coolify deployment stuck past an hour is cancelled (its build container force-stopped over SSH) instead of blocking every later deploy, and a failed or cancelled deploy posts an alert to the env's Discord status-alerts channel

### Changed

- Bumped `@behindthemusictree/app-kit` to 13.0.0 and added `@behindthemusictree/app-kit-ui` 13.0.0: styled popups, auth callback handler and genre-tree components now come from `app-kit-ui`; `app-kit` is headless (hooks, providers, schemas).
- Bumped `@behindthemusictree/app-kit` to 12.0.0, `@behindthemusictree/brand` to 12.0.0 and `@behindthemusictree/ui` to 0.2.0 (`ui` is now a peer of app-kit, so hear owns the single installed copy).
- My genre tree: genre playlists are requested with `treeName=canonical` (app-kit 8.1.0)
- Bumped `@behindthemusictree/app-kit` to 8.3.0: the genre details panel lists the genre playlist's tracks with infinite scroll, and clicking one plays the playlist from that track; the genre tree also gets the Google Maps-style search bar (8.2.x).
- Bumped `@behindthemusictree/app-kit` to 8.3.1: the genre panel's track rows no longer pick up the global `button` styles (dark rounded blocks with unreadable text).
- Bumped `@behindthemusictree/app-kit` to 9.0.0: genre playlists load in a single flattened list (`useListFullGenrePlaylists` now returns an array), so the genre tree and the genre playlists page load much faster.

### Fixed

- My genre tree: the stacked view renders its per-root cards again and scrolls the page instead of zooming the tree (Ctrl/Cmd+wheel still zooms); Tailwind now scans app-kit's built output so classes used only inside app-kit are generated (app-kit 8.1.2)
- My genre tree: in stacked view, a horizontal trackpad swipe pans the tree instead of navigating back, a one-finger vertical scroll no longer nudges it, and pinch-zoom is no longer hijacked by page scroll (app-kit 8.1.3)
- My genre tree: genre-tree styles now come from app-kit's bundled genre-tree-view instead of the stale direct `genre-tree-view` 0.3.0 dependency (removed), so the floating zoom controls are styled

### Fixed

- Buttons without their own background no longer render with a dark fill and extra padding from a leftover global `button` rule, which is removed from `globals.css`.
- Links without their own color class inherit the surrounding text color instead of the Vite template's purple; the unused template classes (`.card`, `.read-the-docs`) are removed from `globals.css`.

## [0.4.1] - 2026-09-29

### Changed

- **Deploy**: `build-and-deploy.yml` builds the image on GitHub-hosted runners, pushes it to GHCR (`ghcr.io/behindthemusictree/htmt-front`, `staging` / `prod` tags), and triggers the Coolify deploy, instead of Coolify building from git on the VPS. `NEXT_PUBLIC_*` build args come from org-level GitHub variables.

### Removed

- **Deploy**: Coolify PR preview deployments.

## [0.4.0] - 2026-09-28

### Changed

- My genre tree: playing a genre starts after its first 100 tracks load, and the queue loads more as you near the end or scroll the sidebar (app-kit 8.0.0)

## [0.3.0] - 2026-09-27

### Added

- `CHANGELOG.md`, updated under `[Unreleased]` by every user-facing change

### Changed

- `@behindthemusictree/app-kit` 6.0.0 → 7.0.0: the genre tree detail panel loads from the lean `genres/{uuid}/overview/` endpoint, prefetched on hover, and opens without re-rendering the tree
- Me genre tree: the archived-tracks count is read from the genre overview (`uploadedTracksArchivedCount`)

## [0.2.0] - 2026-08-23

### Added

- Genre rename popup in the me-genre-tree page
- 85% coverage threshold enforced in CI

### Changed

- `@behindthemusictree/app-kit` 2.0.0 → 3.0.0 (uploadTrack capability, track/player type renames, error/auth popup wrappers, connectivity error handling)
- Strict Gitflow (`develop` integration branch, `release/*`/`hotfix/*` into `main`) — see `CONTRIBUTING.md`

[Unreleased]: https://github.com/BehindTheMusicTree/hear-the-music-tree-frontend/compare/v0.4.0...develop
[0.4.0]: https://github.com/BehindTheMusicTree/hear-the-music-tree-frontend/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/BehindTheMusicTree/hear-the-music-tree-frontend/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/BehindTheMusicTree/hear-the-music-tree-frontend/releases/tag/v0.2.0
