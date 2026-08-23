import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Unit/component tests run without React Strict Mode (single render, deterministic counts).

afterEach(() => {
  cleanup();
});
