import { describe, it, expect } from "vitest";
import { toPlayerTrack } from "./player-track";
import type { TrackDetailed } from "@behindthemusictree/app-kit/genre-tree";

describe("toPlayerTrack", () => {
  it("maps a youtube track to a PlayerTrack with youtubeVideoId", () => {
    const track = {
      uuid: "t1",
      title: "Song",
      artists: [{ name: "Artist A" }],
      kind: "youtube",
      youtubeVideoId: "abc123",
    } as unknown as TrackDetailed;

    expect(toPlayerTrack(track)).toEqual({
      id: "t1",
      title: "Song",
      artists: [{ name: "Artist A" }],
      kind: "youtube",
      youtubeVideoId: "abc123",
    });
  });

  it("maps a non-youtube track to an audio PlayerTrack with an empty streamUrl", () => {
    const track = {
      uuid: "t2",
      title: "Other Song",
      artists: undefined,
      kind: "uploaded",
    } as unknown as TrackDetailed;

    expect(toPlayerTrack(track)).toEqual({
      id: "t2",
      title: "Other Song",
      artists: undefined,
      kind: "audio",
      streamUrl: "",
    });
  });
});
