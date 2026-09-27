import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@behindthemusictree/app-kit/popup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/popup")>();
  return {
    ...actual,
    BasePopup: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <div>
        <h1>{title}</h1>
        {children}
      </div>
    ),
  };
});

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return {
    ...actual,
    Rating: ({ rating, handleChange }: { rating: number | undefined; handleChange: () => void }) => (
      <button data-testid="rating" data-rating={rating} onClick={handleChange} />
    ),
  };
});

import UploadedTrackEditionPopup from "./UploadedTrackEditionPopup";
import { UploadedTrackDetailed } from "./schemas/detailed";

const uploadedTrack = {
  uuid: "t1",
  title: "My Song",
  createdOn: "2024-05-01T00:00:00.000Z",
  file: { durationInSec: 125, filename: "song.mp3", sizeInMo: 4.2, bitrateInKbps: 320, extension: ".mp3" },
} as unknown as UploadedTrackDetailed;

const formValues = { title: "My Song", artists_names: "", genre: "", album_name: "", rating: undefined };

describe("UploadedTrackEditionPopup", () => {
  it("renders form fields seeded from formValues and the file metadata", () => {
    render(
      <UploadedTrackEditionPopup
        uploadedTrack={uploadedTrack}
        formValues={formValues}
        onFormChange={vi.fn()}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("My Song")).toBeInTheDocument();
    expect(screen.getByText(/Filename: song.mp3/)).toBeInTheDocument();
    expect(screen.getByText(/Size: 4.2 Mo/)).toBeInTheDocument();
    expect(screen.getByText(/Bitrate: 320 kbps/)).toBeInTheDocument();
  });

  it("omits file-derived fields when the track has no file", () => {
    const trackWithoutFile = { ...uploadedTrack, file: null } as unknown as UploadedTrackDetailed;
    render(
      <UploadedTrackEditionPopup
        uploadedTrack={trackWithoutFile}
        formValues={formValues}
        onFormChange={vi.fn()}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Filename:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Duration/)).not.toBeInTheDocument();
  });

  it("calls onFormChange when a field changes", () => {
    const onFormChange = vi.fn();
    render(
      <UploadedTrackEditionPopup
        uploadedTrack={uploadedTrack}
        formValues={formValues}
        onFormChange={onFormChange}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("My Song"), { target: { value: "New title" } });

    expect(onFormChange).toHaveBeenCalled();
  });

  it("calls onSubmit when the form is submitted and onClose on cancel", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const onClose = vi.fn();
    render(
      <UploadedTrackEditionPopup
        uploadedTrack={uploadedTrack}
        formValues={formValues}
        onFormChange={vi.fn()}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("Save"));
    expect(onSubmit).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
