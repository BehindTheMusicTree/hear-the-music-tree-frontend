import { describe, it, expect } from "vitest";
import { userEndpoints, userQueryKeys } from "./index";

describe("user api domain", () => {
  it("builds the spotify endpoint path", () => {
    expect(userEndpoints.spotify()).toBe("me/spotify/");
  });

  it("exposes a stable spotify query key", () => {
    expect(userQueryKeys.spotify).toEqual(["spotifyUser"]);
  });
});
