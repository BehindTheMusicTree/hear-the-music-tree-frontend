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
    useUploadTrack: () => useUploadTrackMock(),
    TrackPositionPlayPause: ({ position, handlePlayPauseClick }: any) => (
      <button onClick={handlePlayPauseClick}>play-{position}</button>
    ),
  };
});

import UploadedLibraryPage from "./page";

const uploadedTrack = {
  uuid: "t1",
  kind: "uploaded",
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
  kind: "uploaded",
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

  it("filters out non-uploaded tracks", () => {
    useListTracksMock.mockReturnValue({
      data: { results: [uploadedTrack, { uuid: "s1", kind: "streamed", title: "Streamed Song" }] },
    });

    render(<UploadedLibraryPage />);

    expect(screen.getByText("My Song")).toBeInTheDocument();
    expect(screen.queryByText("Streamed Song")).not.toBeInTheDocument();
  });

  it("shows the upload popup when files are chosen and processes them", () => {
    render(<UploadedLibraryPage />);

    const file = new File(["data"], "song.mp3", { type: "audio/mpeg" });
    fireEvent.change(screen.getByTestId("file-input"), { target: { files: [file] } });

    expect(showPopup).toHaveBeenCalled();
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

  it("renders an empty table when there is no data", () => {
    useListTracksMock.mockReturnValue({ data: undefined });

    render(<UploadedLibraryPage />);

    expect(screen.queryByText("My Song")).not.toBeInTheDocument();
  });
});
