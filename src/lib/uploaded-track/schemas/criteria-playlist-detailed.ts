import { z } from "zod";
import { makeCriteriaPlaylistDetailedSchema } from "@behindthemusictree/app-kit/genre-tree";
import { UploadedTrackDetailedSchema } from "./detailed";

export const CriteriaPlaylistDetailedSchema = makeCriteriaPlaylistDetailedSchema(UploadedTrackDetailedSchema);

export type CriteriaPlaylistDetailed = z.infer<typeof CriteriaPlaylistDetailedSchema>;
