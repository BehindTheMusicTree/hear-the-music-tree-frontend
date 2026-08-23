import type { PlayerTrack } from "@behindthemusictree/app-kit/player";
import type { TrackDetailed } from "@lib/uploaded-track";

export function toPlayerTrack(track: TrackDetailed): PlayerTrack {
  return {
    kind: "audio",
    id: track.uuid,
    title: track.title,
    artists: track.artists?.map((artist) => ({ name: artist.name })),
    streamUrl: "",
  };
}
