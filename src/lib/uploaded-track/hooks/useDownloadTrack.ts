import { useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFetchWrapper, Scope } from "@behindthemusictree/app-kit/transport";
import { useSession } from "@behindthemusictree/app-kit/auth";
import { uploadedTrackEndpoints, uploadedTrackQueryKeys } from "../api";

export interface UseDownloadTrackOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function useDownloadTrack(
  uuid: string,
  scope: Scope | null,
  getBackendBaseUrl: () => string,
  options?: UseDownloadTrackOptions,
) {
  const { fetch } = useFetchWrapper(getBackendBaseUrl);
  const { session, sessionRestored } = useSession();
  const { onSuccess, onError } = options ?? {};
  const lastDataRef = useRef<unknown>(undefined);
  const lastErrorRef = useRef<Error | null>(null);

  const result = useQuery({
    queryKey:
      scope === "me" ? uploadedTrackQueryKeys.download(uuid) : ["uploadedTrack", "download", "none", uuid],
    queryFn: async () => {
      if (scope !== "me") throw new Error("Downloading tracks is only supported for the me scope");
      const response = await fetch(uploadedTrackEndpoints.download(uuid), true, true, {}, {}, true);

      return response;
    },
    enabled: !!uuid && scope === "me" && sessionRestored && !!session?.accessToken,
  });

  useEffect(() => {
    lastDataRef.current = undefined;
    lastErrorRef.current = null;
  }, [uuid, scope]);

  useEffect(() => {
    if (result.data !== undefined && result.data !== lastDataRef.current && !result.isLoading) {
      lastDataRef.current = result.data;
      onSuccess?.(result.data);
    }
  }, [result.data, result.isLoading, onSuccess]);

  useEffect(() => {
    if (result.error != null && result.error !== lastErrorRef.current) {
      lastErrorRef.current = result.error as Error;
      onError?.(result.error as Error);
    }
  }, [result.error, onError]);

  return result;
}
