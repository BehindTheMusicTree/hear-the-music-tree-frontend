import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper, useValidatedMutation, Scope } from "@behindthemusictree/app-kit/transport";
import { useInvalidateAllGenrePlaylistQueries } from "@behindthemusictree/app-kit/genre-tree";
import { uploadedTrackEndpoints, uploadedTrackQueryKeys } from "../api";
import { UploadedTrackUpdateSchema } from "../schemas/update";
import { UploadedTrackDetailedSchema } from "../schemas/detailed";

export function useUpdateUploadedTrack(scope: Scope | null, getBackendBaseUrl: () => string) {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper(getBackendBaseUrl);
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();

  const mutation = useValidatedMutation({
    inputSchema: z.object({
      uuid: z.string(),
      data: UploadedTrackUpdateSchema,
    }),
    outputSchema: UploadedTrackDetailedSchema,
    mutationFn: async ({ uuid, data }) => {
      if (scope !== "me") throw new Error("Updating tracks is only supported for the me scope");

      const response = await fetch(uploadedTrackEndpoints.update(uuid), true, true, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      // Handle case where API returns null
      if (response === null) {
        throw new Error("API returned null response");
      }

      return response;
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: uploadedTrackQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: uploadedTrackQueryKeys.detail(uuid) });
      invalidateAllGenrePlaylistQueries();
    },
  });
  return mutation;
}
