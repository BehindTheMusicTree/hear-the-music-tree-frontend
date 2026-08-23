import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const { setSession, setConnectivityError, fetchMock, exchangeCodeWithBackend, resolveRedirectUri, storeRedirectUrl } =
  vi.hoisted(() => ({
    setSession: vi.fn(),
    setConnectivityError: vi.fn(),
    fetchMock: vi.fn(),
    exchangeCodeWithBackend: vi.fn(),
    resolveRedirectUri: vi.fn((uri: string) => `resolved:${uri}`),
    storeRedirectUrl: vi.fn(),
  }));

vi.mock("@behindthemusictree/app-kit/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/auth")>();
  return {
    ...actual,
    useSession: () => ({ setSession }),
    exchangeCodeWithBackend,
    resolveRedirectUri,
    storeRedirectUrl,
    SPOTIFY_EXCHANGE_CONFIG: { endpoint: "auth/spotify/", redirectStorageKey: "spotify_redirect", rethrowErrorCodes: [] },
  };
});

vi.mock("@behindthemusictree/app-kit/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/transport")>();
  return {
    ...actual,
    useConnectivityError: () => ({ setConnectivityError }),
    useFetchWrapper: () => ({ fetch: fetchMock }),
  };
});

vi.mock("@lib/site-urls", () => ({ getBackendBaseUrl: () => "https://backend.example.com" }));

import { useSpotifyAuth } from "./useSpotifyAuth";

describe("useSpotifyAuth", () => {
  const originalEnv = { ...process.env };
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("throws when Spotify env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    delete process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
    const { result } = renderHook(() => useSpotifyAuth());

    expect(() => result.current.handleSpotifyOAuth()).toThrow("Spotify configuration is missing");
  });

  it("redirects to the Spotify auth URL with the expected params when configured", () => {
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID = "client-id";
    process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI = "https://app.example.com/callback";
    process.env.NEXT_PUBLIC_SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
    const { result } = renderHook(() => useSpotifyAuth());

    result.current.handleSpotifyOAuth("/me-genre-tree");

    expect(storeRedirectUrl).toHaveBeenCalledWith("spotify_redirect", "/me-genre-tree");
    expect(window.location.href).toContain("https://accounts.spotify.com/authorize?");
    expect(window.location.href).toContain("client_id=client-id");
  });

  it("delegates authToBackendFromSpotifyCode to exchangeCodeWithBackend", async () => {
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID = "client-id";
    process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI = "https://app.example.com/callback";
    exchangeCodeWithBackend.mockResolvedValue("/redirect-after");
    const { result } = renderHook(() => useSpotifyAuth());

    const redirect = await result.current.authToBackendFromSpotifyCode("auth-code");

    expect(redirect).toBe("/redirect-after");
    expect(exchangeCodeWithBackend).toHaveBeenCalledWith(
      fetchMock,
      setSession,
      setConnectivityError,
      expect.objectContaining({ redirectStorageKey: "spotify_redirect" }),
      "auth-code",
    );
  });
});
