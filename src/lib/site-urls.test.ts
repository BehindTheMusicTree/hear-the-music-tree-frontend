import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const buildBackendBaseUrl = vi.fn(() => "https://api.staging.example.com");

vi.mock("@behindthemusictree/brand", () => ({
  HTMT_API_SUBDOMAIN: "api",
  ORG_DOMAIN: "example.com",
}));

vi.mock("@behindthemusictree/app-kit/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@behindthemusictree/app-kit/transport")>();
  return { ...actual, buildBackendBaseUrl };
});

describe("getBackendBaseUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    buildBackendBaseUrl.mockClear();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns the override URL when NEXT_PUBLIC_BACKEND_BASE_URL is set", async () => {
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL = "https://override.example.com";
    const { getBackendBaseUrl } = await import("./site-urls");
    expect(getBackendBaseUrl()).toBe("https://override.example.com");
    expect(buildBackendBaseUrl).not.toHaveBeenCalled();
  });

  it("falls back to the subdomain-derived URL when no override is set", async () => {
    delete process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    process.env.NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT = "api";
    const { getBackendBaseUrl } = await import("./site-urls");
    expect(getBackendBaseUrl()).toBe("https://api.staging.example.com");
    expect(buildBackendBaseUrl).toHaveBeenCalledWith({
      apiSubdomain: "api",
      orgDomain: "example.com",
      apiRootSegment: "api",
      isProduction: false,
    });
  });

  it("throws when NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT is missing", async () => {
    delete process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    delete process.env.NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT;
    const { getBackendBaseUrl } = await import("./site-urls");
    expect(() => getBackendBaseUrl()).toThrow("NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT is required");
  });
});

describe("getGrowBackendBaseUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns NEXT_PUBLIC_GROW_API_BASE_URL", async () => {
    process.env.NEXT_PUBLIC_GROW_API_BASE_URL = "https://grow.example.com/v1";
    const { getGrowBackendBaseUrl } = await import("./site-urls");
    expect(getGrowBackendBaseUrl()).toBe("https://grow.example.com/v1");
  });

  it("throws when NEXT_PUBLIC_GROW_API_BASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_GROW_API_BASE_URL;
    const { getGrowBackendBaseUrl } = await import("./site-urls");
    expect(() => getGrowBackendBaseUrl()).toThrow("NEXT_PUBLIC_GROW_API_BASE_URL is required");
  });
});

describe("getGrowArtistUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("builds the artist page URL on the grow site", async () => {
    process.env.NEXT_PUBLIC_GROW_FRONT_BASE_URL = "https://grow.example.com";
    const { getGrowArtistUrl } = await import("./site-urls");
    expect(getGrowArtistUrl("abc")).toBe("https://grow.example.com/artists/abc");
  });

  it("throws when NEXT_PUBLIC_GROW_FRONT_BASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_GROW_FRONT_BASE_URL;
    const { getGrowArtistUrl } = await import("./site-urls");
    expect(() => getGrowArtistUrl("abc")).toThrow("NEXT_PUBLIC_GROW_FRONT_BASE_URL is required");
  });
});
