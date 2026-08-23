import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlayerControls from "./PlayerControls";

describe("PlayerControls", () => {
  it("shows a play icon and calls onPlayPause when not playing", () => {
    const onPlayPause = vi.fn();
    render(
      <PlayerControls
        isPlaying={false}
        onPlayPause={onPlayPause}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText("Play"));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it("labels the button Pause when playing", () => {
    render(
      <PlayerControls isPlaying={true} onPlayPause={vi.fn()} onNext={vi.fn()} onPrevious={vi.fn()} />,
    );

    expect(screen.getByLabelText("Pause")).toBeInTheDocument();
  });

  it("labels the button Loading and disables it while loading", () => {
    render(
      <PlayerControls
        isPlaying={false}
        isLoading
        onPlayPause={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    );

    const button = screen.getByLabelText("Loading");
    expect(button).toBeDisabled();
  });

  it("calls onNext and onPrevious when their buttons are clicked", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    render(
      <PlayerControls isPlaying={false} onPlayPause={vi.fn()} onNext={onNext} onPrevious={onPrevious} />,
    );

    fireEvent.click(screen.getByLabelText("Next track"));
    fireEvent.click(screen.getByLabelText("Previous track"));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("disables the next button when isNextDisabled is true", () => {
    render(
      <PlayerControls
        isPlaying={false}
        onPlayPause={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        isNextDisabled
      />,
    );

    expect(screen.getByLabelText("Next track")).toBeDisabled();
  });
});
