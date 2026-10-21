## Summary
- Bump `@behindthemusictree/app-kit` to 13.0.0 (headless) and add `@behindthemusictree/app-kit-ui` 13.0.0.
- Styled components (popups, `AuthCallbackHandler`, `GenreTreeView`, `TrackListSidebar`, `Rating`, `TrackPositionPlayPause`, …) now import from `app-kit-ui`; hooks/providers/schemas stay on `app-kit`.
- `layout.tsx` imports `app-kit-ui/genre-tree/styles.css`.
- Test mocks split between `app-kit` and `app-kit-ui`.

## Test plan
- [x] `pnpm lint && pnpm build && pnpm test`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
