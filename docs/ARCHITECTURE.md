# Architecture

## Domain

Hear the Music Tree lets users browse a genre tree, manage genre-based
playlists, and manage an uploaded audio library, with an in-app player.
Authentication is via Spotify and Google OAuth.

## Routes (`src/app`)

- `page.tsx` — root `/` redirects to `/me-genre-tree`.
- `layout.tsx` — root HTML layout; loads global CSS and design-system CSS from
  `@behindthemusictree/brand` and `@behindthemusictree/genre-tree-view`.
- `providers.tsx` — client providers: React Query, session (auth), popups,
  player, track list.
- `AppContent.tsx` — app shell chrome: header, player, popups, OAuth callback
  handling, auth-gating logic.
- `global-error.tsx`, `not-found.tsx` — error/404 pages.
- Route group `(app)` (`(app)/layout.tsx`) wraps authenticated pages with
  `Providers` + `AppContent`:
  - `/me-genre-tree` — genre tree view.
  - `/me-genre-playlists` — genre-based playlists.
  - `/me-uploaded-library` — uploaded track library.
  - `/auth/spotify`, `/auth/google` (with `/callback` subroutes) — OAuth
    callback handlers.

There are no API routes (`route.ts`) — this is a pure client app talking to an
external backend.

## API layer (`src/api`)

Domain-organized (currently only `domains/user`):

- `endpoints.ts` — URL path builders (e.g. `me/spotify/`).
- `queryKeys.ts` — React Query keys.
- `index.ts` — barrel export.

Actual HTTP fetching is delegated to `@behindthemusictree/app-kit`'s
`useFetchWrapper`, pointed at `getBackendBaseUrl()` (`src/lib/site-urls.ts`),
which resolves either from `NEXT_PUBLIC_BACKEND_BASE_URL` (explicit override) or
`NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT`.

## Schemas (`src/schemas`)

Zod domain schemas, e.g. `domain/spotify-user.ts`, which normalizes multiple raw
Spotify-user API response shapes into a single `SpotifyUserDetailed` type/schema.
`domain/artist/display.ts` is a display-formatting helper (not itself a schema).

## Components, hooks, lib

- `components/auth` — OAuth callback UI handler.
- `components/features/menu` — app header/nav menu.
- `components/features/player` — audio player UI (controls, progress bar,
  auto-advance).
- `components/ui` — generic UI (Page wrapper, popup children for auth/network/
  error dialogs).
- `hooks` — `useSpotifyAuth`, `useGoogleAuth` (OAuth redirect flows),
  `useSpotifyUser` (fetch/query current Spotify user).
- `lib` — `constants/` (app name, layout sizes, route auth requirements),
  `sentry.js` (client Sentry init), `site-urls.ts` (backend base URL
  resolution), `player-track.ts`, `utils.ts`.

## External integrations

- BTMT backend API (base URL from `src/lib/site-urls.ts`)
- Spotify OAuth
- Google OAuth
- Sentry — manually initialized via `src/lib/sentry.js` (called from
  `AppContent.tsx`), guarded by `NEXT_PUBLIC_SENTRY_IS_ACTIVE`. No standalone
  `sentry.client.config.ts`/`sentry.server.config.ts`.

## `@behindthemusictree/app-kit`

Before adding new shared logic, check whether `app-kit` already provides it —
it supplies most of the cross-cutting functionality used throughout
`providers.tsx` and `AppContent.tsx`:

- `transport` — fetch wrapper, query client
- `auth` — `SessionProvider`
- `popup` — `PopupProvider` / `usePopup`
- `player` — `PlayerProvider` / `usePlayer`
- `genre-tree` — `TrackListProvider`, sidebar, library endpoints, and domain
  types (`ArtistMinimum`, `UploadedTrackDetailed`)
