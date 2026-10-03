# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Bumped `@behindthemusictree/app-kit` to 9.0.0: genre playlists load in a single flattened list (`useListFullGenrePlaylists` now returns an array), so the genre tree and the genre playlists page load much faster.
- My genre tree: genre playlists are requested with `treeName=canonical` (app-kit 8.1.0)
- Bumped `@behindthemusictree/app-kit` to 8.3.0: the genre details panel lists the genre playlist's tracks with infinite scroll, and clicking one plays the playlist from that track; the genre tree also gets the Google Maps-style search bar (8.2.x).

### Fixed

- My genre tree: the stacked view renders its per-root cards again and scrolls the page instead of zooming the tree (Ctrl/Cmd+wheel still zooms); Tailwind now scans app-kit's built output so classes used only inside app-kit are generated (app-kit 8.1.2)
- My genre tree: in stacked view, a horizontal trackpad swipe pans the tree instead of navigating back, a one-finger vertical scroll no longer nudges it, and pinch-zoom is no longer hijacked by page scroll (app-kit 8.1.3)
- My genre tree: genre-tree styles now come from app-kit's bundled genre-tree-view instead of the stale direct `genre-tree-view` 0.3.0 dependency (removed), so the floating zoom controls are styled

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
