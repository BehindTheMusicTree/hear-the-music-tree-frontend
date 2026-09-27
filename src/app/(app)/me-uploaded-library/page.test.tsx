import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const {
  useListTracksMock,
  usePlayerMock,
  usePopupMock,
  useTrackListMock,
  useUploadTrackMock,
  showPopup,
  hidePopup,
  handlePlayPauseAction,
  playNewTrackListFromTrackUuid,
  uploadTrackMutateAsync,
} = vi.hoisted(() => ({
  useListTracksMock: vi.fn(),
  usePlayerMock: vi.fn(),
  usePopupMock: vi.fn(),
  useTrackListMock: vi.fn(),
  useUploadTrackMock: vi.fn(),
  showPopup: vi.fn(),
  hidePopup: vi.fn(),
  handlePlayPauseAction: vi.fn(),
  playNewTrackListFromTrackUuid: vi.fn(),
  uploadTrackMutateAsync: vi.fn(),
}));

vi.mock("@behindthemusictree/app-kit/player", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/player")>();
  return { ...actual, usePlayer: () => usePlayerMock() };
});

vi.mock("@behindthemusictree/app-kit/popup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/popup")>();
  return {
    ...actual,
    usePopup: () => usePopupMock(),
    TrackUploadPopup: ({ onProcessFile, onClose }: any) => (
      <div>
        <button onClick={() => onProcessFile({ name: "song.mp3" }, null)}>process file</button>
        <button onClick={onClose}>close upload popup</button>
      </div>
    ),
  };
});

vi.mock("@behindthemusictree/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/ui")>();
  return {
    ...actual,
    UploadButtons: ({ onFileChange }: any) => (
      <input
        type="file"
        data-testid="file-input"
        onChange={onFileChange}
      />
    ),
  };
});

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return {
    ...actual,
    useTrackList: () => useTrackListMock(),
    useListTracks: () => useListTracksMock(),
    TrackPositionPlayPause: ({ position, handlePlayPauseClick }: any) => (
      <button onClick={handlePlayPauseClick}>play-{position}</button>
    ),
  };
});

vi.mock("@lib/uploaded-track", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lib/uploaded-track")>();
  return {
    ...actual,
    useUploadTrack: () => useUploadTrackMock(),
  };
});

import UploadedLibraryPage from "./page";

const uploadedTrack = {
  uuid: "t1",
  title: "My Song",
  artists: [{ name: "Artist A" }],
  album: { name: "Album A" },
  genre: { name: "Rock" },
  rating: 3,
  file: { durationInSec: 125, extension: ".mp3", bitrateInKbps: 320 },
  playCount: 4,
};

const uploadedTrackNoAlbumGenre = {
  uuid: "t2",
  title: "Other Song",
  artists: [],
  album: null,
  genre: null,
  rating: 0,
  file: { durationInSec: 60, extension: ".wav", bitrateInKbps: 1411 },
  playCount: 0,
};

describe("UploadedLibraryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useListTracksMock.mockReturnValue({ data: { results: [uploadedTrack, uploadedTrackNoAlbumGenre] } });
    usePlayerMock.mockReturnValue({ playerTrackObject: null, handlePlayPauseAction });
    usePopupMock.mockReturnValue({ showPopup, hidePopup });
    useTrackListMock.mockReturnValue({ playNewTrackListFromTrackUuid });
    useUploadTrackMock.mockReturnValue({ mutateAsync: uploadTrackMutateAsync });
  });

  it("renders uploaded tracks with their metadata", () => {
    render(<UploadedLibraryPage />);

    expect(screen.getByText("My Song")).toBeInTheDocument();
    expect(screen.getByText("Other Song")).toBeInTheDocument();
    expect(screen.getByText("Album A")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument();
  });

  it("shows the upload popup when files are chosen and processes them", () => {
    render(<UploadedLibraryPage />);

    const file = new File(["data"], "song.mp3", { type: "audio/mpeg" });
    fireEvent.change(screen.getByTestId("file-input"), { target: { files: [file] } });

    expect(showPopup).toHaveBeenCalled();

    const popupElement = showPopup.mock.calls[0][0];
    render(popupElement);

    fireEvent.click(screen.getByText("process file"));
    expect(uploadTrackMutateAsync).toHaveBeenCalledWith({ file: { name: "song.mp3" } });

    fireEvent.click(screen.getByText("close upload popup"));
    expect(hidePopup).toHaveBeenCalled();
  });

  it("does not show the upload popup when no files are chosen", () => {
    render(<UploadedLibraryPage />);

    fireEvent.change(screen.getByTestId("file-input"), { target: { files: [] } });

    expect(showPopup).not.toHaveBeenCalled();
  });

  it("plays a new track list when a track that isn't currently playing is clicked", () => {
    render(<UploadedLibraryPage />);

    fireEvent.click(screen.getByText("play-1"));

    expect(playNewTrackListFromTrackUuid).toHaveBeenCalledWith(uploadedTrack, "me");
    expect(handlePlayPauseAction).not.toHaveBeenCalled();
  });

  it("toggles play/pause when the currently playing track is clicked", () => {
    usePlayerMock.mockReturnValue({
      playerTrackObject: { track: { id: "t1" } },
      handlePlayPauseAction,
    });

    render(<UploadedLibraryPage />);

    fireEvent.click(screen.getByText("play-1"));

    expect(handlePlayPauseAction).toHaveBeenCalled();
    expect(playNewTrackListFromTrackUuid).not.toHaveBeenCalled();
  });

  it("no-ops when a rating star is changed", () => {
    const { container } = render(<UploadedLibraryPage />);

    const radios = container.querySelectorAll('input[type="radio"]');
    expect(() => fireEvent.click(radios[1])).not.toThrow();
  });

  it("renders an empty table when there is no data", () => {
    useListTracksMock.mockReturnValue({ data: undefined });

    render(<UploadedLibraryPage />);

    expect(screen.queryByText("My Song")).not.toBeInTheDocument();
  });
});
