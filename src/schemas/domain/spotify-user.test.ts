import { describe, it, expect } from "vitest";
import { SpotifyUserDetailedSchema, SpotifyUserFromApiResponseSchema } from "./spotify-user";

describe("SpotifyUserDetailedSchema", () => {
  it("parses a raw spotify user object", () => {
    const raw = {
      id: "u1",
      spotify_id: "sp1",
      display_name: "Alice",
      email: "alice@example.com",
      images: [{ url: "http://img", width: 100, height: 100 }],
      followers: { href: null, total: 5 },
      href: "http://href",
      type: "user",
      uri: "spotify:user:u1",
    };
    expect(SpotifyUserDetailedSchema.parse(raw)).toEqual(raw);
  });

  it("parses a wrapped { spotify_user } object", () => {
    const wrapped = { spotify_user: { id: "u2", spotify_id: "sp2" } };
    const result = SpotifyUserDetailedSchema.parse(wrapped);
    expect(result.id).toBe("u2");
    expect(result.spotify_id).toBe("sp2");
    expect(result.display_name).toBeNull();
    expect(result.followers).toEqual({ href: null, total: 0 });
  });

  it("falls back spotify_id to id when spotify_id is missing", () => {
    const result = SpotifyUserDetailedSchema.parse({ id: "only-id" });
    expect(result.id).toBe("only-id");
    expect(result.spotify_id).toBe("only-id");
  });

  it("defaults optional fields when entirely absent", () => {
    const result = SpotifyUserDetailedSchema.parse({});
    expect(result).toEqual({
      id: "",
      spotify_id: "",
      display_name: null,
      email: null,
      images: [],
      followers: { href: null, total: 0 },
      href: "",
      type: "user",
      uri: "",
    });
  });
});

describe("SpotifyUserFromApiResponseSchema", () => {
  it("maps the first result's spotifyId to id and spotify_id", () => {
    const apiResponse = {
      results: [
        {
          spotifyId: "sp-first",
          displayName: "Bob",
          email: "bob@example.com",
          images: [],
          followers: { href: null, total: 2 },
        },
      ],
    };
    const result = SpotifyUserFromApiResponseSchema.parse(apiResponse);
    expect(result.id).toBe("sp-first");
    expect(result.spotify_id).toBe("sp-first");
    expect(result.display_name).toBe("Bob");
  });

  it("falls back to spotifyProfile fields when top-level fields are missing", () => {
    const apiResponse = {
      results: [
        {
          spotifyProfile: { id: "profile-id", displayName: "Carl", email: "carl@example.com" },
        },
      ],
    };
    const result = SpotifyUserFromApiResponseSchema.parse(apiResponse);
    expect(result.id).toBe("profile-id");
    expect(result.display_name).toBe("Carl");
    expect(result.email).toBe("carl@example.com");
  });

  it("returns a default empty user when results is empty", () => {
    const result = SpotifyUserFromApiResponseSchema.parse({ results: [] });
    expect(result).toEqual({
      id: "",
      spotify_id: "",
      display_name: null,
      email: null,
      images: [],
      followers: { href: null, total: 0 },
      href: "",
      type: "user",
      uri: "",
    });
  });
});
