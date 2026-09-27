# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/BehindTheMusicTree/hear-the-music-tree-frontend/compare/v0.3.0...develop
[0.3.0]: https://github.com/BehindTheMusicTree/hear-the-music-tree-frontend/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/BehindTheMusicTree/hear-the-music-tree-frontend/releases/tag/v0.2.0
