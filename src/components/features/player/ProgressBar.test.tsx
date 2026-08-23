import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { setCurrentTime, usePlayerMock, useCurrentTimeMock } = vi.hoisted(() => ({
  setCurrentTime: vi.fn(),
  usePlayerMock: vi.fn(),
  useCurrentTimeMock: vi.fn(),
}));

vi.mock("@behindthemusictree/app-kit/player", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/player")>();
  return { ...actual, usePlayer: () => usePlayerMock(), useCurrentTime: () => useCurrentTimeMock() };
});

import ProgressBar from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders nothing when there is no active track", () => {
    usePlayerMock.mockReturnValue({ duration: 0, playerTrackObject: null });
    useCurrentTimeMock.mockReturnValue(0);
    const { container } = render(<ProgressBar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when duration is 0 even with a track", () => {
    usePlayerMock.mockReturnValue({
      duration: 0,
      playerTrackObject: { mediaController: { setCurrentTime } },
    });
    useCurrentTimeMock.mockReturnValue(0);
    const { container } = render(<ProgressBar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("formats and displays current time and duration", () => {
    usePlayerMock.mockReturnValue({
      duration: 125,
      playerTrackObject: { mediaController: { setCurrentTime } },
    });
    useCurrentTimeMock.mockReturnValue(65);

    render(<ProgressBar />);

    expect(screen.getByText("1:05")).toBeInTheDocument();
    expect(screen.getByText("2:05")).toBeInTheDocument();
  });

  it("seeks via the media controller when the range input changes", () => {
    usePlayerMock.mockReturnValue({
      duration: 100,
      playerTrackObject: { mediaController: { setCurrentTime } },
    });
    useCurrentTimeMock.mockReturnValue(10);

    render(<ProgressBar />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "42" } });

    expect(setCurrentTime).toHaveBeenCalledWith(42);
  });

  it("does not throw when seeking without a media controller", () => {
    usePlayerMock.mockReturnValue({ duration: 100, playerTrackObject: {} });
    useCurrentTimeMock.mockReturnValue(10);

    render(<ProgressBar />);
    const slider = screen.getByRole("slider");
    expect(() => fireEvent.change(slider, { target: { value: "42" } })).not.toThrow();
  });
});
