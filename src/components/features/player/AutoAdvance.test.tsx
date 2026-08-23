import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const { handleNextTrack, setOnTrackEnd, setSelectedTrack, usePlayerMock, useTrackListMock } = vi.hoisted(() => ({
  handleNextTrack: vi.fn(),
  setOnTrackEnd: vi.fn(),
  setSelectedTrack: vi.fn(),
  usePlayerMock: vi.fn(),
  useTrackListMock: vi.fn(),
}));

vi.mock("@behindthemusictree/app-kit/player", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/player")>();
  return { ...actual, usePlayer: () => usePlayerMock() };
});

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return { ...actual, useTrackList: () => useTrackListMock() };
});

import AutoAdvance from "./AutoAdvance";

const trackList = {
  tracks: [
    { uuid: "t1", title: "First" },
    { uuid: "t2", title: "Second" },
  ],
};

describe("AutoAdvance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlayerMock.mockReturnValue({ handleNextTrack, setOnTrackEnd });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[0], setSelectedTrack });
  });

  it("renders nothing", () => {
    const { container } = render(<AutoAdvance />);
    expect(container).toBeEmptyDOMElement();
  });

  it("registers an onTrackEnd callback and clears it on unmount", () => {
    const { unmount } = render(<AutoAdvance />);
    expect(setOnTrackEnd).toHaveBeenCalledWith(expect.any(Function));

    unmount();
    expect(setOnTrackEnd).toHaveBeenLastCalledWith(null);
  });

  it("advances to the next track when the registered callback fires", () => {
    render(<AutoAdvance />);
    const registeredSetter = setOnTrackEnd.mock.calls[0][0];
    const handleTrackEnd = registeredSetter();

    handleTrackEnd();

    expect(handleNextTrack).toHaveBeenCalledTimes(1);
    const [tracks, currentTrack, onTrackChange] = handleNextTrack.mock.calls[0];
    expect(tracks).toHaveLength(2);
    expect(currentTrack.id).toBe("t1");

    onTrackChange({ id: "t2" });
    expect(setSelectedTrack).toHaveBeenCalledWith(trackList.tracks[1]);
  });

  it("does not call handleNextTrack when there is no track list or selected track", () => {
    useTrackListMock.mockReturnValue({ trackList: null, selectedTrack: null, setSelectedTrack });
    render(<AutoAdvance />);
    const registeredSetter = setOnTrackEnd.mock.calls[0][0];
    const handleTrackEnd = registeredSetter();

    handleTrackEnd();

    expect(handleNextTrack).not.toHaveBeenCalled();
  });
});
