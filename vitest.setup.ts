import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Unit/component tests run without React Strict Mode (single render, deterministic counts).

// Node's built-in global `localStorage` shadows happy-dom's implementation but is
// unusable without the `--localstorage-file` flag, leaving `globalThis.localStorage`
// undefined under vitest. Polyfill it so code that touches localStorage doesn't crash.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
