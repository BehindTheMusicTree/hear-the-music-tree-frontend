import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GenreCreationPopup from "./GenreCreationPopup";

describe("GenreCreationPopup", () => {
  it("shows the root placeholder when there is no parent", () => {
    render(<GenreCreationPopup onSubmit={vi.fn()} />);
    expect(screen.getByDisplayValue("(root genre)")).toBeInTheDocument();
  });

  it("shows the parent name when a parent is given", () => {
    render(<GenreCreationPopup onSubmit={vi.fn()} parent={{ uuid: "p1", name: "Rock" } as any} />);
    expect(screen.getByDisplayValue("Rock")).toBeInTheDocument();
  });

  it("submits the entered name and parent uuid when Save is clicked", () => {
    const onSubmit = vi.fn();
    render(<GenreCreationPopup onSubmit={onSubmit} parent={{ uuid: "p1", name: "Rock" } as any} />);

    const nameInput = document.body.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Jazz" } });
    fireEvent.click(screen.getByText("Save"));

    expect(onSubmit).toHaveBeenCalledWith({ name: "Jazz", parent: "p1" });
  });

  it("submits with an undefined parent when there is no parent", () => {
    const onSubmit = vi.fn();
    render(<GenreCreationPopup onSubmit={onSubmit} />);

    const nameInput = document.body.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Blues" } });
    fireEvent.click(screen.getByText("Save"));

    expect(onSubmit).toHaveBeenCalledWith({ name: "Blues", parent: undefined });
  });

  it("renders form errors when present", () => {
    render(
      <GenreCreationPopup
        onSubmit={vi.fn()}
        formErrors={[{ field: "name", message: "Name is required" }]}
      />,
    );

    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });
});
