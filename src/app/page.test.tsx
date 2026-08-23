import { describe, it, expect, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect }));

import HomePage from "./page";

describe("HomePage", () => {
  it("redirects to the genre tree page", () => {
    HomePage();

    expect(redirect).toHaveBeenCalledWith("/me-genre-tree");
  });
});
