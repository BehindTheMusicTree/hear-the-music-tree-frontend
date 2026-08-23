import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const { fetchMock, getSpotifyRequiredCached, setSpotifyRequiredCached, clearSpotifyRequiredCached, useQueryWithParse } =
  vi.hoisted(() => ({
    fetchMock: vi.fn(),
    getSpotifyRequiredCached: vi.fn(() => false),
    setSpotifyRequiredCached: vi.fn(),
    clearSpotifyRequiredCached: vi.fn(),
    useQueryWithParse: vi.fn(() => ({ data: undefined })),
  }));

class FakeBackendError extends Error {
  code: string;
  constructor(code: string) {
    super("backend error");
    this.code = code;
  }
}

vi.mock("@behindthemusictree/app-kit/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/auth")>();
  return {
    ...actual,
    useSession: () => ({ sessionRestored: true }),
    getSpotifyRequiredCached,
    setSpotifyRequiredCached,
    clearSpotifyRequiredCached,
  };
});

vi.mock("@behindthemusictree/app-kit/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/transport")>();
  return {
    ...actual,
    useFetchWrapper: () => ({ fetch: fetchMock }),
    useQueryWithParse,
    ErrorCode: { BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED: "BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED" },
    BackendError: FakeBackendError,
  };
});

vi.mock("@lib/site-urls", () => ({ getBackendBaseUrl: () => "https://backend.example.com" }));

import { useFetchSpotifyUser } from "./useSpotifyUser";

describe("useFetchSpotifyUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSpotifyRequiredCached.mockReturnValue(false);
  });

  it("enables the query when the session is restored and spotify isn't cached as required", () => {
    renderHook(() => useFetchSpotifyUser());

    expect(useQueryWithParse).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true, context: "useFetchSpotifyUser" }),
    );
  });

  it("disables the query when spotify auth is already known to be required", () => {
    getSpotifyRequiredCached.mockReturnValue(true);
    renderHook(() => useFetchSpotifyUser());

    expect(useQueryWithParse).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("disables the query when explicitly overridden", () => {
    renderHook(() => useFetchSpotifyUser({ enabled: false }));

    expect(useQueryWithParse).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("queryFn clears the spotify-required cache and returns the result on success", async () => {
    fetchMock.mockResolvedValue({ id: "u1" });
    renderHook(() => useFetchSpotifyUser());
    const { queryFn } = useQueryWithParse.mock.calls[0][0];

    const result = await queryFn();

    expect(result).toEqual({ id: "u1" });
    expect(clearSpotifyRequiredCached).toHaveBeenCalled();
  });

  it("queryFn throws when the fetch result is null", async () => {
    fetchMock.mockResolvedValue(null);
    renderHook(() => useFetchSpotifyUser());
    const { queryFn } = useQueryWithParse.mock.calls[0][0];

    await expect(queryFn()).rejects.toThrow("Spotify profile unavailable");
  });

  it("queryFn marks spotify as required when the backend reports authorization is required", async () => {
    fetchMock.mockRejectedValue(new FakeBackendError("BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED"));
    renderHook(() => useFetchSpotifyUser());
    const { queryFn } = useQueryWithParse.mock.calls[0][0];

    await expect(queryFn()).rejects.toThrow("backend error");
    expect(setSpotifyRequiredCached).toHaveBeenCalled();
  });

  it("queryFn rethrows other backend errors without marking spotify as required", async () => {
    fetchMock.mockRejectedValue(new FakeBackendError("SOME_OTHER_ERROR"));
    renderHook(() => useFetchSpotifyUser());
    const { queryFn } = useQueryWithParse.mock.calls[0][0];

    await expect(queryFn()).rejects.toThrow("backend error");
    expect(setSpotifyRequiredCached).not.toHaveBeenCalled();
  });
});
