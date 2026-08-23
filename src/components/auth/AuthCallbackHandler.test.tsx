import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const {
  showPopup,
  usePopupMock,
  handleSpotifyOAuth,
  authToBackendFromSpotifyCode,
  authToBackendFromGoogleCode,
  handleGoogleOAuth,
} = vi.hoisted(() => ({
  showPopup: vi.fn(),
  usePopupMock: vi.fn(),
  handleSpotifyOAuth: vi.fn(),
  authToBackendFromSpotifyCode: vi.fn(),
  authToBackendFromGoogleCode: vi.fn(),
  handleGoogleOAuth: vi.fn(),
}));

vi.mock("@behindthemusictree/app-kit/popup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/popup")>();
  return { ...actual, usePopup: () => usePopupMock() };
});

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({ handleSpotifyOAuth, authToBackendFromSpotifyCode }),
}));

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({ authToBackendFromGoogleCode, handleGoogleOAuth }),
}));

vi.mock("@behindthemusictree/app-kit/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/auth")>();
  return {
    ...actual,
    AuthCallbackHandler: ({ onReauthRequired, onOAuthMisconfigured, onSpotifyAuthError }: any) => (
      <div>
        <button onClick={onReauthRequired}>trigger reauth</button>
        <button onClick={() => onOAuthMisconfigured("BAC4018")}>trigger misconfigured</button>
        <button onClick={() => onSpotifyAuthError("Spotify failed", vi.fn())}>trigger spotify error</button>
      </div>
    ),
  };
});

import HearAuthCallbackHandler from "./AuthCallbackHandler";

describe("HearAuthCallbackHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePopupMock.mockReturnValue({ showPopup });
  });

  it("shows the sign-in popup when reauthentication is required", () => {
    render(<HearAuthCallbackHandler />);

    fireEvent.click(screen.getByText("trigger reauth"));

    expect(showPopup).toHaveBeenCalledWith(expect.anything(), "auth");
  });

  it("shows the internal error popup for an OAuth misconfiguration", () => {
    render(<HearAuthCallbackHandler />);

    fireEvent.click(screen.getByText("trigger misconfigured"));

    expect(showPopup).toHaveBeenCalledWith(expect.anything());
  });

  it("shows the spotify auth error popup for a spotify auth error", () => {
    render(<HearAuthCallbackHandler />);

    fireEvent.click(screen.getByText("trigger spotify error"));

    expect(showPopup).toHaveBeenCalledWith(expect.anything());
  });
});
