import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundPage from "./not-found";

describe("NotFoundPage", () => {
  it("renders a 404 message", () => {
    render(<NotFoundPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("The requested page does not exist")).toBeInTheDocument();
  });
});
