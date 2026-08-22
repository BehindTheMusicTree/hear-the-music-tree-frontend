import type { PlayerTrack } from "@behindthemusictree/app-kit/player";
import type { TrackDetailed } from "@behindthemusictree/app-kit/genre-tree";

export function toPlayerTrack(track: TrackDetailed): PlayerTrack {
  const base = {
    id: track.uuid,
    title: track.title,
    artists: track.artists?.map((artist) => ({ name: artist.name })),
  };
  if (track.kind === "youtube") {
    return { ...base, kind: "youtube", youtubeVideoId: track.youtubeVideoId };
  }
  return { ...base, kind: "audio", streamUrl: "" };
}
