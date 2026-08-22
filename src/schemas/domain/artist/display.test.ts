import { describe, it, expect } from "vitest";
import { getArtistsDisplay } from "./display";

describe("getArtistsDisplay", () => {
  it("joins multiple artist names with a comma", () => {
    expect(getArtistsDisplay([{ name: "Alice" }, { name: "Bob" }] as any)).toBe("Alice, Bob");
  });

  it("returns an empty string for null", () => {
    expect(getArtistsDisplay(null)).toBe("");
  });

  it("returns an empty string for undefined", () => {
    expect(getArtistsDisplay(undefined)).toBe("");
  });

  it("returns an empty string for an empty array", () => {
    expect(getArtistsDisplay([])).toBe("");
  });
});
