"use client";

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useEffect } from "react";
import AppContent from "./AppContent";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import {
  ConnectivityErrorProvider,
  useConnectivityError,
  AuthRequired,
  BackendError,
  NetworkError,
  ErrorCode,
} from "@behindthemusictree/app-kit/transport";

const pathnameRef = { current: "/me-genre-tree" };
const requirementRef = { current: "any" as false | "any" | "spotify" };
const playerTrackObjectRef = { current: null as unknown };
const sidebarVisibleRef = { current: false };

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@lib/constants/routes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lib/constants/routes")>();
  return { ...actual, getRouteAuthRequirement: () => requirementRef.current };
});

vi.mock("@behindthemusictree/app-kit/player", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/player")>();
  return { ...actual, usePlayer: () => ({ playerTrackObject: playerTrackObjectRef.current }) };
});

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return {
    ...actual,
    useTrackListSidebarVisibility: () => ({ isTrackListSidebarVisible: sidebarVisibleRef.current }),
    TrackListSidebar: () => <div data-testid="sidebar-marker" />,
  };
});

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({ handleSpotifyOAuth: vi.fn() }),
}));

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({ handleGoogleOAuth: vi.fn() }),
}));

vi.mock("@lib/sentry", () => ({ initSentry: vi.fn() }));

vi.mock("@components/features/menu/AppHeader", () => ({ default: () => null }));
vi.mock("@components/features/player/Player", () => ({ default: () => <div data-testid="player-marker" /> }));
vi.mock("@components/features/player/AutoAdvance", () => ({ default: () => null }));
vi.mock("@components/auth/AuthCallbackHandler", () => ({ default: () => null }));

function SetConnectivityError({
  error,
}: {
  error: InstanceType<typeof AuthRequired> | InstanceType<typeof BackendError> | InstanceType<typeof NetworkError>;
}) {
  const { setConnectivityError } = useConnectivityError();
  useEffect(() => {
    setConnectivityError(error);
  }, [setConnectivityError, error]);
  return null;
}

function renderWithError(
  error: InstanceType<typeof AuthRequired> | InstanceType<typeof BackendError> | InstanceType<typeof NetworkError>,
) {
  act(() => {
    render(
      <PopupProvider>
        <ConnectivityErrorProvider>
          <SetConnectivityError error={error} />
          <AppContent>
            <div>main</div>
          </AppContent>
        </ConnectivityErrorProvider>
      </PopupProvider>,
    );
  });
}

describe("AppContent renderer wiring and layout branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathnameRef.current = "/me-genre-tree";
    requirementRef.current = "any";
    playerTrackObjectRef.current = null;
    sidebarVisibleRef.current = false;
  });

  it("shows the sign-in AuthPopup when AuthRequired occurs on a route that requires auth", () => {
    renderWithError(new AuthRequired(ErrorCode.BACKEND_UNAUTHORIZED));

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign in with Spotify")).toBeInTheDocument();
  });

  it("shows the SpotifyAuthErrorPopup for a spotify authentication error on a spotify-required route", () => {
    requirementRef.current = "spotify";

    renderWithError(new BackendError(ErrorCode.BACKEND_SPOTIFY_AUTHENTICATION_ERROR, "Spotify login failed"));

    expect(screen.getByText("Authentication Failed")).toBeInTheDocument();
    expect(screen.getByText("Spotify login failed")).toBeInTheDocument();
  });

  it("shows the spotify-only AuthPopup when spotify authorization is required on a spotify-only route", () => {
    requirementRef.current = "spotify";

    renderWithError(new BackendError(ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED));

    expect(screen.getByText("Connect with Spotify")).toBeInTheDocument();
  });

  it("shows the google AuthErrorPopup for a google authentication error", () => {
    renderWithError(new BackendError(ErrorCode.BACKEND_GOOGLE_AUTHENTICATION_ERROR, "Google login failed"));

    expect(screen.getByText("Sign-in error")).toBeInTheDocument();
    expect(screen.getByText("Google login failed")).toBeInTheDocument();
  });

  it("shows the NetworkErrorPopup for a network error", () => {
    renderWithError(new NetworkError(ErrorCode.NETWORK_OFFLINE));

    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("renders the track list sidebar when it is visible", () => {
    sidebarVisibleRef.current = true;

    act(() => {
      render(
        <PopupProvider>
          <ConnectivityErrorProvider>
            <AppContent>
              <div>main</div>
            </AppContent>
          </ConnectivityErrorProvider>
        </PopupProvider>,
      );
    });

    expect(screen.getByTestId("sidebar-marker")).toBeInTheDocument();
  });

  it("renders the Player bar when there is an active track", () => {
    playerTrackObjectRef.current = { track: { id: "t1" } };

    act(() => {
      render(
        <PopupProvider>
          <ConnectivityErrorProvider>
            <AppContent>
              <div>main</div>
            </AppContent>
          </ConnectivityErrorProvider>
        </PopupProvider>,
      );
    });

    expect(screen.getByTestId("player-marker")).toBeInTheDocument();
  });
});
