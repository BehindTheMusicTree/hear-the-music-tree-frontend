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
    GOOGLE_EXCHANGE_CONFIG: { endpoint: "auth/google/", redirectStorageKey: "google_redirect", rethrowErrorCodes: [] },
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

import { useGoogleAuth } from "./useGoogleAuth";

describe("useGoogleAuth", () => {
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

  it("throws when Google env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    delete process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    const { result } = renderHook(() => useGoogleAuth());

    expect(() => result.current.handleGoogleOAuth()).toThrow("Google configuration is missing");
  });

  it("redirects to the Google auth URL with the expected params when configured", () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "client-id";
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI = "https://app.example.com/callback";
    const { result } = renderHook(() => useGoogleAuth());

    result.current.handleGoogleOAuth("/me-genre-tree");

    expect(storeRedirectUrl).toHaveBeenCalledWith("google_redirect", "/me-genre-tree");
    expect(window.location.href).toContain("https://accounts.google.com/o/oauth2/v2/auth?");
    expect(window.location.href).toContain("client_id=client-id");
    expect(window.location.href).toContain(encodeURIComponent("resolved:https://app.example.com/callback"));
  });

  it("delegates authToBackendFromGoogleCode to exchangeCodeWithBackend", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "client-id";
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI = "https://app.example.com/callback";
    exchangeCodeWithBackend.mockResolvedValue("/redirect-after");
    const { result } = renderHook(() => useGoogleAuth());

    const redirect = await result.current.authToBackendFromGoogleCode("auth-code");

    expect(redirect).toBe("/redirect-after");
    expect(exchangeCodeWithBackend).toHaveBeenCalledWith(
      fetchMock,
      setSession,
      setConnectivityError,
      expect.objectContaining({ redirectStorageKey: "google_redirect" }),
      "auth-code",
    );
  });
});
