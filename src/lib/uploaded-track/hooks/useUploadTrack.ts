import { useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper, useValidatedMutation, Scope } from "@behindthemusictree/app-kit/transport";
import { useInvalidateAllGenrePlaylistQueries } from "@behindthemusictree/app-kit/genre-tree";
import { uploadedTrackEndpoints, uploadedTrackQueryKeys } from "../api";
import { UploadedTrackCreationSchema } from "../schemas/creation";
import { UploadedTrackDetailedSchema } from "../schemas/detailed";

export function useUploadTrack(scope: Scope | null, getBackendBaseUrl: () => string) {
  const queryClient = useQueryClient();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();
  const { fetch } = useFetchWrapper(getBackendBaseUrl);

  return useValidatedMutation({
    inputSchema: UploadedTrackCreationSchema,
    outputSchema: UploadedTrackDetailedSchema,
    mutationFn: async (data) => {
      if (scope !== "me") throw new Error("Uploading tracks is only supported for the me scope");

      const formData = new FormData();
      formData.append("file", data.file);

      if (data.track_file_fingerprint_must_be_unique !== undefined) {
        formData.append("track_file_fingerprint_must_be_unique", String(data.track_file_fingerprint_must_be_unique));
      }
      if (data.title !== undefined && data.title !== null) {
        formData.append("title", data.title);
      }
      if (data.force_title_generation !== undefined) {
        formData.append("force_title_generation", String(data.force_title_generation));
      }
      if (data.artists_names !== undefined && data.artists_names !== null) {
        formData.append("artists_names", data.artists_names);
      }
      if (data.album_name !== undefined && data.album_name !== null) {
        formData.append("album_name", data.album_name);
      }
      if (data.album_artists_names !== undefined && data.album_artists_names !== null) {
        formData.append("album_artists_names", data.album_artists_names);
      }
      if (data.track_number !== undefined) {
        formData.append("track_number", String(data.track_number));
      }
      if (data.genre !== undefined && data.genre !== null) {
        formData.append("genre", data.genre);
      }
      if (data.rating !== undefined) {
        formData.append("rating", String(data.rating));
      }
      if (data.language !== undefined && data.language !== null) {
        formData.append("language", data.language);
      }

      const response = await fetch(uploadedTrackEndpoints.create(), true, true, {
        method: "POST",
        body: formData,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadedTrackQueryKeys.all });
      invalidateAllGenrePlaylistQueries();
    },
  });
}
