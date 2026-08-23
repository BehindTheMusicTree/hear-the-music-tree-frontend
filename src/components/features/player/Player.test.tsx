import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const {
  setVolume,
  setCurrentTime,
  setVolumeOnController,
  handlePlayPauseAction,
  handleNextTrack,
  handlePreviousTrack,
  setSelectedTrack,
  toggleTrackListSidebar,
  usePlayerMock,
  useCurrentTimeMock,
  useTrackListMock,
  useTrackListSidebarVisibilityMock,
} = vi.hoisted(() => ({
  setVolume: vi.fn(),
  setCurrentTime: vi.fn(),
  setVolumeOnController: vi.fn(),
  handlePlayPauseAction: vi.fn(),
  handleNextTrack: vi.fn(),
  handlePreviousTrack: vi.fn(),
  setSelectedTrack: vi.fn(),
  toggleTrackListSidebar: vi.fn(),
  usePlayerMock: vi.fn(),
  useCurrentTimeMock: vi.fn(),
  useTrackListMock: vi.fn(),
  useTrackListSidebarVisibilityMock: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt ?? ""} />,
}));

vi.mock("@behindthemusictree/app-kit/player", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/player")>();
  return { ...actual, usePlayer: () => usePlayerMock(), useCurrentTime: () => useCurrentTimeMock() };
});

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return {
    ...actual,
    useTrackList: () => useTrackListMock(),
    useTrackListSidebarVisibility: () => useTrackListSidebarVisibilityMock(),
  };
});

import Player from "./Player";

const baseTrack = {
  track: { id: "t1", title: "My Song", artists: [{ name: "Artist" }] },
  mediaController: { setCurrentTime, setVolume: setVolumeOnController },
  isReady: true,
};

const trackList = {
  tracks: [
    { uuid: "t1", title: "My Song" },
    { uuid: "t2", title: "Next Song" },
  ],
};

describe("Player", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurrentTimeMock.mockReturnValue(0);
    useTrackListSidebarVisibilityMock.mockReturnValue({
      toggleTrackListSidebar,
      isTrackListSidebarVisible: false,
    });
  });

  it("renders nothing when there is no active track", () => {
    usePlayerMock.mockReturnValue({ playerTrackObject: null, isLoading: false, isPlaying: false, volume: 50, setVolume, handlePlayPauseAction, handleNextTrack, handlePreviousTrack });
    useTrackListMock.mockReturnValue({ trackList: null, selectedTrack: null, setSelectedTrack });

    const { container } = render(<Player />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the track title, artist, and load error when present", () => {
    usePlayerMock.mockReturnValue({
      playerTrackObject: { ...baseTrack, loadError: "Failed to load" },
      isLoading: false,
      isPlaying: false,
      volume: 50,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[0], setSelectedTrack });

    render(<Player />);

    expect(screen.getByText("My Song")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("enables next when a subsequent track exists and calls handleNextTrack on click", () => {
    usePlayerMock.mockReturnValue({
      playerTrackObject: baseTrack,
      isLoading: false,
      isPlaying: false,
      volume: 50,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[0], setSelectedTrack });

    render(<Player />);

    const nextButton = screen.getByLabelText("Next track");
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);
    expect(handleNextTrack).toHaveBeenCalled();
  });

  it("updates the selected track when handleNextTrack invokes its onChange callback", () => {
    handleNextTrack.mockImplementation((tracks, _current, onChange) => onChange(tracks[1]));
    usePlayerMock.mockReturnValue({
      playerTrackObject: baseTrack,
      isLoading: false,
      isPlaying: false,
      volume: 50,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[0], setSelectedTrack });

    render(<Player />);
    fireEvent.click(screen.getByLabelText("Next track"));

    expect(setSelectedTrack).toHaveBeenCalledWith(trackList.tracks[1]);
  });

  it("disables next when there is no subsequent track", () => {
    usePlayerMock.mockReturnValue({
      playerTrackObject: baseTrack,
      isLoading: false,
      isPlaying: false,
      volume: 50,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[1], setSelectedTrack });

    render(<Player />);

    expect(screen.getByLabelText("Next track")).toBeDisabled();
  });

  it("restarts the current track when previous is clicked at least 1s in", () => {
    useCurrentTimeMock.mockReturnValue(5);
    usePlayerMock.mockReturnValue({
      playerTrackObject: baseTrack,
      isLoading: false,
      isPlaying: false,
      volume: 50,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[1], setSelectedTrack });

    render(<Player />);
    fireEvent.click(screen.getByLabelText("Previous track"));

    expect(setCurrentTime).toHaveBeenCalledWith(0);
    expect(handlePreviousTrack).not.toHaveBeenCalled();
  });

  it("goes to the previous track when clicked under 1s in", () => {
    useCurrentTimeMock.mockReturnValue(0.5);
    usePlayerMock.mockReturnValue({
      playerTrackObject: baseTrack,
      isLoading: false,
      isPlaying: false,
      volume: 50,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[1], setSelectedTrack });

    render(<Player />);
    fireEvent.click(screen.getByLabelText("Previous track"));

    expect(handlePreviousTrack).toHaveBeenCalled();
  });

  it("toggles mute and restores the previous volume on unmute", () => {
    usePlayerMock.mockReturnValue({
      playerTrackObject: baseTrack,
      isLoading: false,
      isPlaying: false,
      volume: 70,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[0], setSelectedTrack });

    render(<Player />);

    fireEvent.click(screen.getByLabelText("Mute"));
    expect(setVolume).toHaveBeenCalledWith(0);
    expect(setVolumeOnController).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByLabelText("Unmute"));
    expect(setVolume).toHaveBeenCalledWith(70);
    expect(setVolumeOnController).toHaveBeenCalledWith(70);
  });

  it("updates volume via the range input", () => {
    usePlayerMock.mockReturnValue({
      playerTrackObject: baseTrack,
      isLoading: false,
      isPlaying: false,
      volume: 50,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[0], setSelectedTrack });

    render(<Player />);
    const volumeSlider = document.querySelector('input[type="range"].w-24') as HTMLInputElement;
    fireEvent.change(volumeSlider, { target: { value: "30" } });

    expect(setVolume).toHaveBeenCalledWith(30);
    expect(setVolumeOnController).toHaveBeenCalledWith(30);
  });

  it("toggles the track list sidebar", () => {
    usePlayerMock.mockReturnValue({
      playerTrackObject: baseTrack,
      isLoading: false,
      isPlaying: false,
      volume: 50,
      setVolume,
      handlePlayPauseAction,
      handleNextTrack,
      handlePreviousTrack,
    });
    useTrackListMock.mockReturnValue({ trackList, selectedTrack: trackList.tracks[0], setSelectedTrack });

    render(<Player />);
    fireEvent.click(screen.getByLabelText("Toggle tracklist"));

    expect(toggleTrackListSidebar).toHaveBeenCalledTimes(1);
  });
});
