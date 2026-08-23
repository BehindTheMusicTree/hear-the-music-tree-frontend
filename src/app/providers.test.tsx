import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Providers from "./providers";

describe("Providers", () => {
  it("renders children wrapped in the app's context providers", () => {
    render(
      <Providers>
        <div>child content</div>
      </Providers>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
