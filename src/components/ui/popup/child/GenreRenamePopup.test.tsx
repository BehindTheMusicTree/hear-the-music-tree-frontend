import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GenreRenamePopup from "./GenreRenamePopup";

describe("GenreRenamePopup", () => {
  const genre = { uuid: "g1", name: "Rock" } as any;

  it("pre-fills the input with the genre's current name", () => {
    render(<GenreRenamePopup onSubmit={vi.fn()} genre={genre} />);
    expect(screen.getByDisplayValue("Rock")).toBeInTheDocument();
  });

  it("submits the edited name when Save is clicked", () => {
    const onSubmit = vi.fn();
    const { container } = render(<GenreRenamePopup onSubmit={onSubmit} genre={genre} />);

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Metal" } });
    fireEvent.click(screen.getByText("Save"));

    expect(onSubmit).toHaveBeenCalledWith({ name: "Metal" });
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<GenreRenamePopup onSubmit={vi.fn()} onClose={onClose} genre={genre} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders form errors when present", () => {
    render(
      <GenreRenamePopup
        onSubmit={vi.fn()}
        genre={genre}
        formErrors={[{ field: "name", message: "Name already exists" }]}
      />,
    );

    expect(screen.getByText("Name already exists")).toBeInTheDocument();
  });
});
