import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

const { useTrackListMock, showEditPopupMock } = vi.hoisted(() => ({
  useTrackListMock: vi.fn(),
  showEditPopupMock: vi.fn(),
}));

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return { ...actual, useTrackList: () => useTrackListMock() };
});

vi.mock("./useTrackEdition", () => ({
  useTrackEdition: (...args: unknown[]) => {
    useTrackEditionArgs.push(args);
    return { showEditPopup: showEditPopupMock, TrackEditionComponent: null };
  },
}));

const useTrackEditionArgs: unknown[][] = [];

import UploadedTrackEditAction from "./UploadedTrackEditAction";
import { UploadedTrackDetailed } from "./schemas/detailed";

const track = { uuid: "t1", title: "My Song" } as unknown as UploadedTrackDetailed;
const getBackendBaseUrl = () => "https://backend.example.com";

describe("UploadedTrackEditAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTrackEditionArgs.length = 0;
    useTrackListMock.mockReturnValue({ trackList: { origin: { scope: "me" } } });
  });

  it("passes the current track-list scope to useTrackEdition", () => {
    render(<UploadedTrackEditAction track={track} getBackendBaseUrl={getBackendBaseUrl} />);

    expect(useTrackEditionArgs[0][0]).toBe("me");
  });

  it("falls back to a null scope when there is no track list", () => {
    useTrackListMock.mockReturnValue({ trackList: null });
    render(<UploadedTrackEditAction track={track} getBackendBaseUrl={getBackendBaseUrl} />);

    expect(useTrackEditionArgs[0][0]).toBeNull();
  });

  it("opens the edit popup on click", () => {
    const { container } = render(<UploadedTrackEditAction track={track} getBackendBaseUrl={getBackendBaseUrl} />);

    fireEvent.click(container.querySelector(".edit")!);

    expect(showEditPopupMock).toHaveBeenCalledWith(track);
  });
});
