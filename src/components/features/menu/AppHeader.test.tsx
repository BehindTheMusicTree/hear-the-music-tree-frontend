import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt ?? ""} />,
}));

vi.mock("@behindthemusictree/brand/marks/hear-the-music-tree/hear-the-music-tree-mark.png", () => ({
  default: "/mock-logo.png",
}));

vi.mock("@behindthemusictree/brand/components", () => ({
  TheMusicTreeByline: () => <div data-testid="byline" />,
}));

vi.mock("./MenuGroup", () => ({
  MenuGroup: ({ items }: { items: Array<{ label: string }> }) => (
    <div data-testid="menu-group">{items.map((item) => item.label).join(",")}</div>
  ),
}));

import AppHeader from "./AppHeader";

describe("AppHeader", () => {
  it("renders the app name, logo link, byline, and menu group with route-derived items", () => {
    render(<AppHeader />);

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByTestId("byline")).toBeInTheDocument();
    expect(screen.getByTestId("menu-group")).toHaveTextContent("MyMusicTree,My Genre Playlists,My Library");
  });

  it("applies an optional className to the header element", () => {
    render(<AppHeader className="custom-class" />);

    expect(screen.getByRole("banner")).toHaveClass("custom-class");
  });
});
