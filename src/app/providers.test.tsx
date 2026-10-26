import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTrackNoun } from "@behindthemusictree/app-kit/track-noun";
import Providers from "./providers";

function NounProbe() {
  const { singular, plural } = useTrackNoun();
  return <span>{`${singular}/${plural}`}</span>;
}

describe("Providers", () => {
  it("renders children wrapped in the app's context providers", () => {
    render(
      <Providers>
        <div>child content</div>
      </Providers>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("supplies the track noun", () => {
    render(
      <Providers>
        <NounProbe />
      </Providers>,
    );

    expect(screen.getByText("track/tracks")).toBeInTheDocument();
  });
});
