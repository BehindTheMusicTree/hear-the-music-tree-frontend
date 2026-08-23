export const uploadedTrackQueryKeys = {
  all: ["uploadedTracks"] as const,
  list: (page: number) => ["uploadedTracks", "list", page] as const,
  detail: (uuid: string) => ["uploadedTracks", "detail", uuid] as const,
  download: (uuid: string) => ["uploadedTracks", "download", uuid] as const,
};
