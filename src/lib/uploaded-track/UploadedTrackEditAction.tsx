"use client";

import { MdMoreVert } from "react-icons/md";
import { useTrackList } from "@behindthemusictree/app-kit/genre-tree";
import { useTrackEdition } from "./useTrackEdition";
import { UploadedTrackDetailed } from "./schemas/detailed";

export interface UploadedTrackEditActionProps {
  track: UploadedTrackDetailed;
  getBackendBaseUrl: () => string;
}

export default function UploadedTrackEditAction({ track, getBackendBaseUrl }: UploadedTrackEditActionProps) {
  const { trackList } = useTrackList();
  const scope = trackList?.origin?.scope ?? null;
  const { showEditPopup, TrackEditionComponent } = useTrackEdition(scope, getBackendBaseUrl);

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    showEditPopup(track);
  };

  return (
    <>
      <div
        className="edit flex text-base w-6 items-center justify-center mr-2 cursor-pointer"
        onClick={handleEditClick}
      >
        <MdMoreVert size={20} />
      </div>
      {TrackEditionComponent}
    </>
  );
}
