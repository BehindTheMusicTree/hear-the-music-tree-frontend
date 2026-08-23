import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { updateTrackMock, useUpdateUploadedTrackMock } = vi.hoisted(() => ({
  updateTrackMock: vi.fn(),
  useUpdateUploadedTrackMock: vi.fn(),
}));

vi.mock("./hooks/useUpdateUploadedTrack", () => ({
  useUpdateUploadedTrack: (...args: unknown[]) => useUpdateUploadedTrackMock(...args),
}));

vi.mock("./UploadedTrackEditionPopup", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="edition-popup" data-props={JSON.stringify(Object.keys(props))} />
  ),
}));

import { useTrackEdition } from "./useTrackEdition";
import { UploadedTrackDetailed } from "./schemas/detailed";

const getBackendBaseUrl = () => "https://backend.example.com";

const track = {
  uuid: "t1",
  title: "My Song",
  artists: [{ name: "Artist A" }, { name: "Artist B" }],
  album: { name: "Album A" },
  genre: { name: "Rock" },
  rating: 3,
} as unknown as UploadedTrackDetailed;

describe("useTrackEdition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUpdateUploadedTrackMock.mockReturnValue({
      mutate: updateTrackMock,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: null,
    });
  });

  it("renders nothing until showEditPopup is called", () => {
    const { result } = renderHook(() => useTrackEdition("me", getBackendBaseUrl));
    expect(result.current.TrackEditionComponent).toBeNull();
  });

  it("populates form values from the track and shows the popup", () => {
    const { result } = renderHook(() => useTrackEdition("me", getBackendBaseUrl));

    act(() => result.current.showEditPopup(track));

    expect(result.current.TrackEditionComponent).not.toBeNull();
  });

  it("falls back to empty values when the track has no title/artists/genre/album/rating", () => {
    const { result } = renderHook(() => useTrackEdition("me", getBackendBaseUrl));
    const bareTrack = { uuid: "t2" } as unknown as UploadedTrackDetailed;

    act(() => result.current.showEditPopup(bareTrack));

    expect(result.current.TrackEditionComponent).not.toBeNull();
  });

  it("submitting strips the rating when it's the null sentinel", async () => {
    const { result } = renderHook(() => useTrackEdition("me", getBackendBaseUrl));
    act(() => result.current.showEditPopup(track));

    const onFormChange = (result.current.TrackEditionComponent as React.ReactElement).props as {
      onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };
    act(() => {
      onFormChange.onFormChange({ target: { name: "rating", value: "-1" } } as unknown as React.ChangeEvent<
        HTMLInputElement
      >);
    });

    const formEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    const onSubmit = (result.current.TrackEditionComponent as React.ReactElement).props as {
      onSubmit: (e: React.FormEvent) => void;
    };
    await act(async () => onSubmit.onSubmit(formEvent));

    expect(updateTrackMock).toHaveBeenCalledWith({
      uuid: "t1",
      data: expect.objectContaining({ title: "My Song", artists_names: "Artist A, Artist B" }),
    });
    expect(updateTrackMock.mock.calls[0][0].data.rating).toBeUndefined();
  });

  it("submitting keeps a valid rating", async () => {
    const { result } = renderHook(() => useTrackEdition("me", getBackendBaseUrl));
    act(() => result.current.showEditPopup(track));

    const onFormChange = (result.current.TrackEditionComponent as React.ReactElement).props as {
      onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };
    act(() => {
      onFormChange.onFormChange({ target: { name: "rating", value: "4" } } as unknown as React.ChangeEvent<
        HTMLInputElement
      >);
    });

    const formEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    const onSubmit = (result.current.TrackEditionComponent as React.ReactElement).props as {
      onSubmit: (e: React.FormEvent) => void;
    };
    await act(async () => onSubmit.onSubmit(formEvent));

    expect(updateTrackMock).toHaveBeenCalledWith({
      uuid: "t1",
      data: expect.objectContaining({ rating: "4" }),
    });
  });

  it("hides the popup when the mutation succeeds", () => {
    const { result, rerender } = renderHook(() => useTrackEdition("me", getBackendBaseUrl));
    act(() => result.current.showEditPopup(track));
    expect(result.current.TrackEditionComponent).not.toBeNull();

    useUpdateUploadedTrackMock.mockReturnValue({
      mutate: updateTrackMock,
      isSuccess: true,
      isError: false,
      data: { uuid: "t1" },
      error: null,
    });
    rerender();

    expect(result.current.TrackEditionComponent).toBeNull();
  });

  it("hides the popup when the mutation errors", () => {
    const { result, rerender } = renderHook(() => useTrackEdition("me", getBackendBaseUrl));
    act(() => result.current.showEditPopup(track));
    expect(result.current.TrackEditionComponent).not.toBeNull();

    useUpdateUploadedTrackMock.mockReturnValue({
      mutate: updateTrackMock,
      isSuccess: false,
      isError: true,
      data: undefined,
      error: new Error("boom"),
    });
    rerender();

    expect(result.current.TrackEditionComponent).toBeNull();
  });

  it("closing the popup via onClose hides it", () => {
    const { result } = renderHook(() => useTrackEdition("me", getBackendBaseUrl));
    act(() => result.current.showEditPopup(track));

    const onClose = (result.current.TrackEditionComponent as React.ReactElement).props as { onClose: () => void };
    act(() => onClose.onClose());

    expect(result.current.TrackEditionComponent).toBeNull();
  });
});
