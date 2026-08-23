import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PopupProvider, usePopup } from "@behindthemusictree/app-kit/popup";
import { BackendError, ErrorCode } from "@behindthemusictree/app-kit/transport";

const { routerReplace, authToBackendFromGoogleCode, handleSpotifyOAuth, handleGoogleOAuth } = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  authToBackendFromGoogleCode: vi.fn(),
  handleSpotifyOAuth: vi.fn(),
  handleGoogleOAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({ handleSpotifyOAuth }),
}));

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({ authToBackendFromGoogleCode, handleGoogleOAuth }),
}));

import GoogleOAuthCallbackPage from "./page";

function Harness() {
  const { activePopup } = usePopup();
  return (
    <>
      <GoogleOAuthCallbackPage />
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
  window.history.pushState({}, "", `/auth/google/callback${search}`);
}

describe("GoogleOAuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setUrl("");
  });

  it("shows the pending state initially", () => {
    setUrl("?code=abc");
    authToBackendFromGoogleCode.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText("Connecting with Google...")).toBeInTheDocument();
  });

  it("shows an inline error when google reports an error param", async () => {
    setUrl("?error=access_denied");

    renderPage();

    await waitFor(() => expect(screen.getByText("Authentication Error")).toBeInTheDocument());
    expect(screen.getByText("Google authentication failed: access_denied")).toBeInTheDocument();
  });

  it("shows an inline error when no code is present", async () => {
    setUrl("");

    renderPage();

    await waitFor(() => expect(screen.getByText("No authorization code received from Google")).toBeInTheDocument());
  });

  it("completes silently when the code exchange succeeds", async () => {
    setUrl("?code=abc");
    authToBackendFromGoogleCode.mockResolvedValue("/me-genre-tree");

    renderPage();

    await waitFor(() => expect(screen.queryByText("Connecting with Google...")).not.toBeInTheDocument());
    expect(document.body.textContent).toBe("");
  });

  it("shows the auth popup and redirects home on an expired/invalid code error", async () => {
    setUrl("?code=abc");
    authToBackendFromGoogleCode.mockRejectedValue(
      new BackendError(ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED),
    );

    renderPage();

    await waitFor(() => expect(screen.getByText("Sign in")).toBeInTheDocument());
    expect(routerReplace).toHaveBeenCalledWith("/");
  });

  it("shows an internal error popup for an unauthorized client error", async () => {
    setUrl("?code=abc");
    authToBackendFromGoogleCode.mockRejectedValue(
      new BackendError(ErrorCode.BACKEND_GOOGLE_OAUTH_UNAUTHORIZED_CLIENT),
    );

    renderPage();

    await waitFor(() => expect(screen.getByText("Internal Error")).toBeInTheDocument());
  });

  it("shows a generic backend-auth-error message for BACKEND_AUTH_ERROR", async () => {
    setUrl("?code=abc");
    authToBackendFromGoogleCode.mockRejectedValue(new BackendError(ErrorCode.BACKEND_AUTH_ERROR));

    renderPage();

    await waitFor(() =>
      expect(
        screen.getByText("Failed to authenticate with the backend server. Please try again later."),
      ).toBeInTheDocument(),
    );
  });

  it("shows the backend error's own message for other backend error codes", async () => {
    setUrl("?code=abc");
    authToBackendFromGoogleCode.mockRejectedValue(new BackendError(ErrorCode.BACKEND_GOOGLE_OAUTH_MISCONFIGURED));

    renderPage();

    await waitFor(() => expect(screen.getByText("Authentication Error")).toBeInTheDocument());
  });

  it("shows an unexpected-error message for a non-BackendError failure", async () => {
    setUrl("?code=abc");
    authToBackendFromGoogleCode.mockRejectedValue(new Error("boom"));

    renderPage();

    await waitFor(() =>
      expect(screen.getByText("An unexpected error occurred. Please try again later.")).toBeInTheDocument(),
    );
  });
});
