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

import { useUploadTrack } from "./useUploadTrack";

const getBackendBaseUrl = () => "https://backend.example.com";
const file = new File(["content"], "song.mp3", { type: "audio/mpeg" });

describe("useUploadTrack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useValidatedMutationMock.mockReturnValue({ mutate: vi.fn() });
  });

  it("mutationFn posts a FormData payload with only the provided fields", async () => {
    fetchMock.mockResolvedValue({ uuid: "t1" });
    renderHook(() => useUploadTrack("me", getBackendBaseUrl));
    const { mutationFn } = useValidatedMutationMock.mock.calls[0][0];

    const result = await mutationFn({
      file,
      title: "My Song",
      artists_names: "Artist A",
      album_name: "Album A",
      album_artists_names: "Artist A",
      genre: "Rock",
      language: "en",
      track_file_fingerprint_must_be_unique: true,
      force_title_generation: false,
      track_number: 3,
      rating: 4,
    });

    expect(result).toEqual({ uuid: "t1" });
    const [endpoint, withAuth, withRetry, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("me/library/uploaded/");
    expect(withAuth).toBe(true);
    expect(withRetry).toBe(true);
    expect(init.method).toBe("POST");

    const body = init.body as FormData;
    expect(body.get("file")).toBe(file);
    expect(body.get("title")).toBe("My Song");
    expect(body.get("artists_names")).toBe("Artist A");
    expect(body.get("album_name")).toBe("Album A");
    expect(body.get("album_artists_names")).toBe("Artist A");
    expect(body.get("genre")).toBe("Rock");
    expect(body.get("language")).toBe("en");
    expect(body.get("track_file_fingerprint_must_be_unique")).toBe("true");
    expect(body.get("force_title_generation")).toBe("false");
    expect(body.get("track_number")).toBe("3");
    expect(body.get("rating")).toBe("4");
  });

  it("mutationFn omits undefined/null optional fields from the FormData payload", async () => {
    fetchMock.mockResolvedValue({ uuid: "t1" });
    renderHook(() => useUploadTrack("me", getBackendBaseUrl));
    const { mutationFn } = useValidatedMutationMock.mock.calls[0][0];

    await mutationFn({ file });

    const body = fetchMock.mock.calls[0][3].body as FormData;
    expect(body.get("title")).toBeNull();
    expect(body.get("artists_names")).toBeNull();
    expect(body.get("album_name")).toBeNull();
    expect(body.get("genre")).toBeNull();
    expect(body.get("language")).toBeNull();
    expect(body.get("track_file_fingerprint_must_be_unique")).toBeNull();
    expect(body.get("force_title_generation")).toBeNull();
    expect(body.get("track_number")).toBeNull();
    expect(body.get("rating")).toBeNull();
  });

  it("mutationFn throws for a non-me scope", async () => {
    renderHook(() => useUploadTrack(null, getBackendBaseUrl));
    const { mutationFn } = useValidatedMutationMock.mock.calls[0][0];

    await expect(mutationFn({ file })).rejects.toThrow("Uploading tracks is only supported for the me scope");
  });

  it("onSuccess invalidates uploaded track queries and genre playlist queries", () => {
    renderHook(() => useUploadTrack("me", getBackendBaseUrl));
    const { onSuccess } = useValidatedMutationMock.mock.calls[0][0];

    onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["uploadedTracks"] });
    expect(invalidateAllGenrePlaylistQueriesMock).toHaveBeenCalled();
  });
});
