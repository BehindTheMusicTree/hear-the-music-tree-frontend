import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { useListFullGenrePlaylistsMock } = vi.hoisted(() => ({
  useListFullGenrePlaylistsMock: vi.fn(),
}));

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return { ...actual, useListFullGenrePlaylists: () => useListFullGenrePlaylistsMock() };
});

import GenrePlaylistsPage from "./page";

const playlists = [
  { uuid: "u1", name: "Rock Mix", parent: { name: "Rock" }, root: { name: "Music" }, tracksCount: 5 },
  { uuid: "u2", name: "Jazz Mix", parent: null, root: null, tracksCount: 2 },
];

describe("GenrePlaylistsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an error message when the query fails", () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: undefined, isPending: false, error: new Error("nope") });

    render(<GenrePlaylistsPage />);

    expect(screen.getByText("Error loading genre playlists")).toBeInTheDocument();
  });

  it("shows skeleton rows while pending", () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: undefined, isPending: true, error: null });

    const { container } = render(<GenrePlaylistsPage />);

    expect(container.querySelectorAll(".animate-pulse, [class*=Skeleton]").length).toBeGreaterThanOrEqual(0);
    expect(screen.queryByText("Rock Mix")).not.toBeInTheDocument();
  });

  it("renders playlist rows, defaulting parent to '/' and rendering an empty root when absent", () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: { results: playlists }, isPending: false, error: null });

    render(<GenrePlaylistsPage />);

    expect(screen.getByText("Rock Mix")).toBeInTheDocument();
    expect(screen.getByText("Jazz Mix")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getAllByText("/").length).toBeGreaterThan(0);
  });

  it("filters rows by name", () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: { results: playlists }, isPending: false, error: null });

    render(<GenrePlaylistsPage />);

    const nameInputs = screen.getAllByPlaceholderText("Filter...");
    fireEvent.change(nameInputs[1], { target: { value: "Jazz" } });

    expect(screen.queryByText("Rock Mix")).not.toBeInTheDocument();
    expect(screen.getByText("Jazz Mix")).toBeInTheDocument();
  });

  it("filters rows by uuid, parent, and root", () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: { results: playlists }, isPending: false, error: null });

    render(<GenrePlaylistsPage />);
    const [uuidInput, , parentInput, rootInput] = screen.getAllByPlaceholderText("Filter...");

    fireEvent.change(uuidInput, { target: { value: "u1" } });
    expect(screen.queryByText("Jazz Mix")).not.toBeInTheDocument();
    fireEvent.change(uuidInput, { target: { value: "" } });

    fireEvent.change(parentInput, { target: { value: "Rock" } });
    expect(screen.queryByText("Jazz Mix")).not.toBeInTheDocument();
    fireEvent.change(parentInput, { target: { value: "" } });

    fireEvent.change(rootInput, { target: { value: "Music" } });
    expect(screen.queryByText("Jazz Mix")).not.toBeInTheDocument();
    expect(screen.getByText("Rock Mix")).toBeInTheDocument();
  });

  it("returns an empty list when there is no data", () => {
    useListFullGenrePlaylistsMock.mockReturnValue({ data: undefined, isPending: false, error: null });

    render(<GenrePlaylistsPage />);

    expect(screen.queryByText("Rock Mix")).not.toBeInTheDocument();
  });
});
