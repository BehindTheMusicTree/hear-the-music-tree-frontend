import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PopupProvider, usePopup } from "@behindthemusictree/app-kit/popup";

const { createGenreMock, renameGenreMock, useCreateGenreMock, useUpdateGenreMock } = vi.hoisted(() => ({
  createGenreMock: vi.fn(),
  renameGenreMock: vi.fn(),
  useCreateGenreMock: vi.fn(),
  useUpdateGenreMock: vi.fn(),
}));

vi.mock("@behindthemusictree/app-kit/genre-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/genre-tree")>();
  return {
    ...actual,
    useCreateGenre: () => useCreateGenreMock(),
    useUpdateGenre: () => useUpdateGenreMock(),
    GenreTreeView: ({ handleGenreCreationAction, handleGenreRenameAction }: any) => (
      <div>
        <button onClick={() => handleGenreCreationAction()}>Add root genre</button>
        <button onClick={() => handleGenreCreationAction({ uuid: "p1", name: "Rock" })}>Add subgenre</button>
        <button onClick={() => handleGenreRenameAction({ uuid: "g1", name: "OldName" })}>Rename genre</button>
      </div>
    ),
  };
});

import GenreTreePage from "./page";

function Harness() {
  const { activePopup } = usePopup();
  return (
    <>
      <GenreTreePage />
      {activePopup}
    </>
  );
}

function renderPage() {
  return render(
    <PopupProvider>
      <Harness />
    </PopupProvider>,
  );
}

describe("GenreTreePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCreateGenreMock.mockReturnValue({ mutate: createGenreMock, formErrors: undefined });
    useUpdateGenreMock.mockReturnValue({ renameGenre: renameGenreMock, formErrors: undefined });
  });

  it("renders the genre tree view", () => {
    renderPage();
    expect(screen.getByText("Add root genre")).toBeInTheDocument();
  });

  it("creates a root genre via the creation popup", () => {
    renderPage();
    fireEvent.click(screen.getByText("Add root genre"));

    expect(screen.getByText("Create Genre")).toBeInTheDocument();
    const nameInput = document.body.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Metal" } });
    fireEvent.click(screen.getByText("Save"));

    expect(createGenreMock).toHaveBeenCalledWith({ name: "Metal", parent: undefined });
    expect(screen.queryByText("Create Genre")).not.toBeInTheDocument();
  });

  it("creates a subgenre with the given parent uuid", () => {
    renderPage();
    fireEvent.click(screen.getByText("Add subgenre"));

    const nameInput = document.body.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Punk" } });
    fireEvent.click(screen.getByText("Save"));

    expect(createGenreMock).toHaveBeenCalledWith({ name: "Punk", parent: "p1" });
  });

  it("renames a genre via the rename popup", () => {
    renderPage();
    fireEvent.click(screen.getByText("Rename genre"));

    expect(screen.getByText("Rename Genre")).toBeInTheDocument();
    const nameInput = document.body.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "NewName" } });
    fireEvent.click(screen.getByText("Save"));

    expect(renameGenreMock).toHaveBeenCalledWith("g1", "NewName");
    expect(screen.queryByText("Rename Genre")).not.toBeInTheDocument();
  });

  it("automatically reopens the creation popup when new form errors arrive", () => {
    useCreateGenreMock.mockReturnValue({
      mutate: createGenreMock,
      formErrors: [{ field: "name", message: "Name already exists" }],
    });

    renderPage();

    expect(screen.getByText("Create Genre")).toBeInTheDocument();
    expect(screen.getByText("Name already exists")).toBeInTheDocument();
  });
});
