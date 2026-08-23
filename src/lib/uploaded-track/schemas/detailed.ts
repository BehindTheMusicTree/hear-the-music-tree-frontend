import { z } from "zod";
import { TrackBaseSchema } from "@behindthemusictree/app-kit/genre-tree";
import { FileDetailedSchema } from "./file";

export const UploadedTrackDetailedSchema = TrackBaseSchema.extend({
  relativeUrl: z.string(),
  file: FileDetailedSchema,
});

export type UploadedTrackDetailed = z.infer<typeof UploadedTrackDetailedSchema>;

// This app only ever handles uploaded tracks — no discriminated union needed.
export type TrackDetailed = UploadedTrackDetailed;
