import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const { fetchMock, useValidatedMutationMock, invalidateAllGenrePlaylistQueriesMock, invalidateQueriesMock } =
  vi.hoisted(() => ({
    fetchMock: vi.fn(),
    useValidatedMutationMock: vi.fn(),
    invalidateAllGenrePlaylistQueriesMock: vi.fn(),
    invalidateQueriesMock: vi.fn(),
  }));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
  };
});

vi.mock("@behindthemusictree/app-kit/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/transport")>();
  return {
    ...actual,
    useFetchWrapper: () => ({ fetch: fetchMock }),
    useValidatedMutation: (options: unknown) => useValidatedMutationMock(options),
  };
});

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return { ...actual, useInvalidateAllGenrePlaylistQueries: () => invalidateAllGenrePlaylistQueriesMock };
});

import { useUpdateUploadedTrack } from "./useUpdateUploadedTrack";

const getBackendBaseUrl = () => "https://backend.example.com";

describe("useUpdateUploadedTrack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useValidatedMutationMock.mockReturnValue({ mutate: vi.fn() });
  });

  it("mutationFn updates the track for the me scope", async () => {
    fetchMock.mockResolvedValue({ uuid: "t1", title: "Updated" });
    renderHook(() => useUpdateUploadedTrack("me", getBackendBaseUrl));
    const { mutationFn } = useValidatedMutationMock.mock.calls[0][0];

    const result = await mutationFn({ uuid: "t1", data: { title: "Updated" } });

    expect(fetchMock).toHaveBeenCalledWith("me/library/uploaded/t1/", true, true, {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });
    expect(result).toEqual({ uuid: "t1", title: "Updated" });
  });

  it("mutationFn throws for a non-me scope", async () => {
    renderHook(() => useUpdateUploadedTrack(null, getBackendBaseUrl));
    const { mutationFn } = useValidatedMutationMock.mock.calls[0][0];

    await expect(mutationFn({ uuid: "t1", data: { title: "Updated" } })).rejects.toThrow(
      "Updating tracks is only supported for the me scope",
    );
  });

  it("mutationFn throws when the API returns null", async () => {
    fetchMock.mockResolvedValue(null);
    renderHook(() => useUpdateUploadedTrack("me", getBackendBaseUrl));
    const { mutationFn } = useValidatedMutationMock.mock.calls[0][0];

    await expect(mutationFn({ uuid: "t1", data: { title: "Updated" } })).rejects.toThrow(
      "API returned null response",
    );
  });

  it("onSuccess invalidates the relevant query keys and genre playlist queries", () => {
    renderHook(() => useUpdateUploadedTrack("me", getBackendBaseUrl));
    const { onSuccess } = useValidatedMutationMock.mock.calls[0][0];

    onSuccess(undefined, { uuid: "t1", data: {} });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["uploadedTracks"] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["uploadedTracks", "detail", "t1"] });
    expect(invalidateAllGenrePlaylistQueriesMock).toHaveBeenCalled();
  });
});
