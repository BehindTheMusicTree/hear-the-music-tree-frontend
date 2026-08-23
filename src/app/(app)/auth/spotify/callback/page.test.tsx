import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PopupProvider, usePopup } from "@behindthemusictree/app-kit/popup";
import { BackendError, ErrorCode } from "@behindthemusictree/app-kit/transport";

const { routerReplace, authToBackendFromSpotifyCode, handleSpotifyOAuth, handleGoogleOAuth } = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  authToBackendFromSpotifyCode: vi.fn(),
  handleSpotifyOAuth: vi.fn(),
  handleGoogleOAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({ authToBackendFromSpotifyCode, handleSpotifyOAuth }),
}));

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({ handleGoogleOAuth }),
}));

import SpotifyOAuthCallbackPage from "./page";

function Harness() {
  const { activePopup } = usePopup();
  return (
    <>
      <SpotifyOAuthCallbackPage />
      {activePopup}
    </>
  );
}

function renderPage() {
  return render(
    <PopupProvider>
      <Harness />
    </PopupProvider>,
  );
}

function setUrl(search: string) {
  window.history.pushState({}, "", `/auth/spotify/callback${search}`);
}

describe("SpotifyOAuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setUrl("");
  });

  it("shows the pending state initially", () => {
    setUrl("?code=abc");
    authToBackendFromSpotifyCode.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText("Connecting to Spotify...")).toBeInTheDocument();
  });

  it("shows an error popup when spotify reports an error param", async () => {
    setUrl("?error=access_denied");

    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Spotify authentication failed: access_denied")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Try Again"));

    await waitFor(() =>
      expect(screen.queryByText("Spotify authentication failed: access_denied")).not.toBeInTheDocument(),
    );
  });

  it("shows an error popup when no code is present", async () => {
    setUrl("");

    renderPage();

    await waitFor(() => expect(screen.getByText("No authorization code received from Spotify")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Try Again"));

    await waitFor(() =>
      expect(screen.queryByText("No authorization code received from Spotify")).not.toBeInTheDocument(),
    );
  });

  it("redirects when the code exchange succeeds with a redirect url", async () => {
    setUrl("?code=abc");
    authToBackendFromSpotifyCode.mockResolvedValue("/me-genre-tree");

    renderPage();

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/me-genre-tree"));
  });

  it("shows the auth popup and redirects home on a spotify authentication error", async () => {
    setUrl("?code=abc");
    authToBackendFromSpotifyCode.mockRejectedValue(
      new BackendError(ErrorCode.BACKEND_SPOTIFY_AUTHENTICATION_ERROR),
    );

    renderPage();

    await waitFor(() => expect(screen.getByText("Sign in")).toBeInTheDocument());
    expect(routerReplace).toHaveBeenCalledWith("/");
  });

  it("shows an internal error popup and redirects home on an invalid client error", async () => {
    setUrl("?code=abc");
    authToBackendFromSpotifyCode.mockRejectedValue(
      new BackendError(ErrorCode.BACKEND_SPOTIFY_OAUTH_INVALID_CLIENT),
    );

    renderPage();

    await waitFor(() => expect(screen.getByText("Internal Error")).toBeInTheDocument());
    expect(routerReplace).toHaveBeenCalledWith("/");
  });

  it("shows a generic backend-auth-error message for BACKEND_AUTH_ERROR", async () => {
    setUrl("?code=abc");
    authToBackendFromSpotifyCode.mockRejectedValue(new BackendError(ErrorCode.BACKEND_AUTH_ERROR));

    renderPage();

    await waitFor(() =>
      expect(
        screen.getByText("Failed to authenticate with the backend server. Please try again later."),
      ).toBeInTheDocument(),
    );
  });

  it("shows an unexpected-error message for a non-BackendError failure", async () => {
    setUrl("?code=abc");
    authToBackendFromSpotifyCode.mockRejectedValue(new Error("boom"));

    renderPage();

    await waitFor(() =>
      expect(screen.getByText("An unexpected error occurred. Please try again later.")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Try Again"));

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/"));
  });
});
