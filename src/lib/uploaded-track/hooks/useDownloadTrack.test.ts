import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const { fetchMock, useQueryMock, useSessionMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  useQueryMock: vi.fn(),
  useSessionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return { ...actual, useQuery: (options: unknown) => useQueryMock(options) };
});

vi.mock("@behindthemusictree/app-kit/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/transport")>();
  return { ...actual, useFetchWrapper: () => ({ fetch: fetchMock }) };
});

vi.mock("@behindthemusictree/app-kit/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/auth")>();
  return { ...actual, useSession: () => useSessionMock() };
});

import { useDownloadTrack } from "./useDownloadTrack";

const getBackendBaseUrl = () => "https://backend.example.com";

describe("useDownloadTrack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockReturnValue({ data: undefined, error: null, isLoading: false });
    useSessionMock.mockReturnValue({ session: { accessToken: "token" }, sessionRestored: true });
  });

  it("enables the query for the me scope once the session is restored", () => {
    renderHook(() => useDownloadTrack("t1", "me", getBackendBaseUrl));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true, queryKey: ["uploadedTracks", "download", "t1"] }),
    );
  });

  it("disables the query for a non-me scope", () => {
    renderHook(() => useDownloadTrack("t1", null, getBackendBaseUrl));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false, queryKey: ["uploadedTrack", "download", "none", "t1"] }),
    );
  });

  it("disables the query when the session hasn't been restored yet", () => {
    useSessionMock.mockReturnValue({ session: undefined, sessionRestored: false });
    renderHook(() => useDownloadTrack("t1", "me", getBackendBaseUrl));

    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it("queryFn fetches the download endpoint for the me scope", async () => {
    fetchMock.mockResolvedValue({ url: "blob:abc" });
    renderHook(() => useDownloadTrack("t1", "me", getBackendBaseUrl));
    const { queryFn } = useQueryMock.mock.calls[0][0];

    const result = await queryFn();

    expect(fetchMock).toHaveBeenCalledWith("me/library/uploaded/t1/download/", true, true, {}, {}, true);
    expect(result).toEqual({ url: "blob:abc" });
  });

  it("queryFn throws for a non-me scope", async () => {
    renderHook(() => useDownloadTrack("t1", null, getBackendBaseUrl));
    const { queryFn } = useQueryMock.mock.calls[0][0];

    await expect(queryFn()).rejects.toThrow("Downloading tracks is only supported for the me scope");
  });

  it("calls onSuccess when new data arrives", () => {
    const onSuccess = vi.fn();
    useQueryMock.mockReturnValue({ data: { url: "blob:abc" }, error: null, isLoading: false });

    renderHook(() => useDownloadTrack("t1", "me", getBackendBaseUrl, { onSuccess }));

    expect(onSuccess).toHaveBeenCalledWith({ url: "blob:abc" });
  });

  it("does not call onSuccess while the query is still loading", () => {
    const onSuccess = vi.fn();
    useQueryMock.mockReturnValue({ data: { url: "blob:abc" }, error: null, isLoading: true });

    renderHook(() => useDownloadTrack("t1", "me", getBackendBaseUrl, { onSuccess }));

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onError when the query errors", () => {
    const onError = vi.fn();
    const error = new Error("boom");
    useQueryMock.mockReturnValue({ data: undefined, error, isLoading: false });

    renderHook(() => useDownloadTrack("t1", "me", getBackendBaseUrl, { onError }));

    expect(onError).toHaveBeenCalledWith(error);
  });
});
