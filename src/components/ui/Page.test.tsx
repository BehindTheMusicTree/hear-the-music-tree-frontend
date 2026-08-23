import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./Page";

describe("Page", () => {
  it("renders the title, children, and data-page attribute", () => {
    render(
      <Page title="My Title" dataPage="my-page">
        <div>content</div>
      </Page>,
    );

    expect(screen.getByRole("heading", { name: "My Title" })).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(document.querySelector('[data-page="my-page"]')).toBeInTheDocument();
  });
});
