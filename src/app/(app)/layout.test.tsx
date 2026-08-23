import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@app/providers", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>,
}));

vi.mock("@app/AppContent", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-content">{children}</div>,
}));

import AppLayout from "./layout";

describe("AppLayout", () => {
  it("wraps children in Providers and AppContent", () => {
    render(
      <AppLayout>
        <div>page content</div>
      </AppLayout>,
    );

    expect(screen.getByTestId("providers")).toBeInTheDocument();
    expect(screen.getByTestId("app-content")).toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });
});
