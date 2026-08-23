import { describe, it, expect } from "vitest";
import { getRouteAuthRequirement, spotifyUserProfileUrl, PATHS, LOGOUT_REDIRECT_PATH, AUTH_CONFIG } from "./routes";

describe("getRouteAuthRequirement", () => {
  it("returns false for the home route", () => {
    expect(getRouteAuthRequirement("/")).toBe(false);
  });

  it("returns the configured auth requirement for an exact match", () => {
    expect(getRouteAuthRequirement(PATHS.ME_GENRE_TREE)).toBe("any");
  });

  it("returns the configured auth requirement for a nested path", () => {
    expect(getRouteAuthRequirement(`${PATHS.ME_GENRE_TREE}/sub`)).toBe("any");
  });

  it("returns false for an unknown route", () => {
    expect(getRouteAuthRequirement("/unknown-route")).toBe(false);
  });
});

describe("spotifyUserProfileUrl", () => {
  it("builds a Spotify profile URL from a user id", () => {
    expect(spotifyUserProfileUrl("abc123")).toBe("https://open.spotify.com/user/abc123");
  });
});

describe("constants", () => {
  it("derives LOGOUT_REDIRECT_PATH from the genre tree path", () => {
    expect(LOGOUT_REDIRECT_PATH).toBe(PATHS.ME_GENRE_TREE);
  });

  it("configures auth for every declared route", () => {
    expect(AUTH_CONFIG.length).toBeGreaterThan(0);
    AUTH_CONFIG.forEach((entry) => expect(entry.path).toBeTruthy());
  });
});
