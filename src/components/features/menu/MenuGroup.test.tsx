import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { showPopup, hidePopup, usePopupMock, useSessionMock, handleSpotifyOAuth, handleGoogleOAuth, pathnameRef } =
  vi.hoisted(() => ({
    showPopup: vi.fn(),
    hidePopup: vi.fn(),
    usePopupMock: vi.fn(),
    useSessionMock: vi.fn(),
    handleSpotifyOAuth: vi.fn(),
    handleGoogleOAuth: vi.fn(),
    pathnameRef: { current: "/me-genre-tree" },
  }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@behindthemusictree/app-kit/popup", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/popup")>();
  return { ...actual, usePopup: () => usePopupMock() };
});

vi.mock("@behindthemusictree/app-kit/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/auth")>();
  return { ...actual, useSession: () => useSessionMock() };
});

vi.mock("@hooks/useSpotifyAuth", () => ({
  useSpotifyAuth: () => ({ handleSpotifyOAuth }),
}));

vi.mock("@hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => ({ handleGoogleOAuth }),
}));

vi.mock("@hooks/useSpotifyUser", () => ({
  useFetchSpotifyUser: () => ({ data: undefined }),
}));

import { MenuGroup } from "./MenuGroup";

const items = [
  { href: "/me-genre-tree", label: "MyMusicTree", icon: <span>icon-tree</span>, authRequired: "any" as const },
  { href: "/spotify-only", label: "Spotify Only", icon: <span>icon-spotify</span>, authRequired: "spotify" as const },
  { href: "/public", label: "Public", icon: <span>icon-public</span>, authRequired: false as const },
  { href: "https://external.example.com", label: "External", icon: <span>icon-ext</span>, external: true },
];

describe("MenuGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathnameRef.current = "/me-genre-tree";
    usePopupMock.mockReturnValue({ showPopup, hidePopup });
    useSessionMock.mockReturnValue({ session: null });
  });

  it("renders all items with labels and marks the current page", () => {
    render(<MenuGroup items={items} />);

    expect(screen.getByText("MyMusicTree")).toBeInTheDocument();
    expect(screen.getByText("Spotify Only")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("External")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /MyMusicTree/ })).toHaveAttribute("aria-current", "page");
  });

  it("hides the auth popup and follows through for a public (authRequired: false) item", () => {
    render(<MenuGroup items={items} />);

    fireEvent.click(screen.getByText("Public"));

    expect(hidePopup).toHaveBeenCalledWith({ onlyIfType: "auth" });
    expect(showPopup).not.toHaveBeenCalled();
  });

  it("hides the auth popup for an external item without navigating via preventDefault", () => {
    render(<MenuGroup items={items} />);

    fireEvent.click(screen.getByText("External"));

    expect(hidePopup).toHaveBeenCalledWith({ onlyIfType: "auth" });
    expect(showPopup).not.toHaveBeenCalled();
  });

  it("shows a spotify-only auth popup when a spotify-required item is clicked while unauthenticated", () => {
    render(<MenuGroup items={items} />);

    fireEvent.click(screen.getByText("Spotify Only"));

    expect(showPopup).toHaveBeenCalledWith(expect.anything(), "auth");
  });

  it("shows the general auth popup when an any-required item is clicked while unauthenticated", () => {
    render(<MenuGroup items={items} />);

    fireEvent.click(screen.getByText("MyMusicTree"));

    expect(showPopup).toHaveBeenCalledWith(expect.anything(), "auth");
  });

  it("hides the popup instead of showing one when the user is already authenticated", () => {
    useSessionMock.mockReturnValue({ session: { accessToken: "token" } });

    render(<MenuGroup items={items} />);
    fireEvent.click(screen.getByText("MyMusicTree"));

    expect(hidePopup).toHaveBeenCalledWith({ onlyIfType: "auth" });
    expect(showPopup).not.toHaveBeenCalled();
  });

  it("renders in a horizontal layout without labels breaking", () => {
    render(<MenuGroup items={items} layout="horizontal" />);

    expect(screen.getAllByText("MyMusicTree").length).toBeGreaterThan(0);
  });

  it("hides the text label but keeps a title attribute when collapsed in the vertical layout", () => {
    render(<MenuGroup items={items} collapsed />);

    expect(screen.queryByText("MyMusicTree")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "icon-tree" })).toHaveAttribute("title", "MyMusicTree");
  });
});
