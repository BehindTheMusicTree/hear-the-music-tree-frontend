import { describe, it, expect } from "vitest";
import { toPlayerTrack } from "./player-track";
import type { TrackDetailed } from "@lib/uploaded-track";

describe("toPlayerTrack", () => {
  it("maps a track to an audio PlayerTrack with an empty streamUrl", () => {
    const track = {
      uuid: "t1",
      title: "Song",
      artists: [{ name: "Artist A" }],
    } as unknown as TrackDetailed;

    expect(toPlayerTrack(track)).toEqual({
      id: "t1",
      title: "Song",
      artists: [{ name: "Artist A" }],
      kind: "audio",
      streamUrl: "",
    });
  });
});
