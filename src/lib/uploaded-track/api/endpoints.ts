// This app owns a single, dedicated backend (hear-the-music-tree-api), so uploaded tracks
// only ever live under the "me" root — no scope branching needed here.
export const uploadedTrackEndpoints = {
  list: () => "me/library/uploaded/",
  detail: (uuid: string) => `me/library/uploaded/${uuid}/`,
  create: () => "me/library/uploaded/",
  update: (uuid: string) => `me/library/uploaded/${uuid}/`,
  delete: (uuid: string) => `me/library/uploaded/${uuid}/`,
  download: (uuid: string) => `me/library/uploaded/${uuid}/download/`,
};
