"use client";

import { FaRegClock } from "react-icons/fa";

import { usePlayer } from "@behindthemusictree/app-kit/player";
import { usePopup, TrackUploadPopup } from "@behindthemusictree/app-kit/popup";
import { UploadButtons } from "@behindthemusictree/ui";
import {
  Rating,
  TrackPositionPlayPause,
  useTrackList,
  useListTracks,
  useUploadTrack,
  formatTime,
  UploadedTrackDetailed,
} from "@behindthemusictree/app-kit/genre-tree";
import Page from "@components/ui/Page";
import { getArtistsDisplay } from "@schemas/domain/artist/display";
import { getBackendBaseUrl } from "@lib/site-urls";

export default function UploadedLibraryPage() {
  const { data: uploadedTracksResponse } = useListTracks("me", getBackendBaseUrl);
  const uploadedTracks = uploadedTracksResponse?.results || [];
  const { playerTrackObject, handlePlayPauseAction } = usePlayer();
  const { showPopup, hidePopup } = usePopup();
  const { playNewTrackListFromTrackUuid } = useTrackList();
  const { mutateAsync: uploadTrackMutateAsync } = useUploadTrack("me", getBackendBaseUrl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      showPopup(
        <TrackUploadPopup
          files={Array.from(files)}
          genre={null}
          onProcessFile={(file, _genre) => uploadTrackMutateAsync({ file })}
          onComplete={() => {}}
          onClose={() => {
            hidePopup();
          }}
          uploadTimeoutMs={Number(process.env.NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS)}
        />,
      );
    }
    event.target.value = "";
  };

  const handlePlayPauseClick = (uploadedTrack: UploadedTrackDetailed) => {
    if (playerTrackObject && playerTrackObject.track.id === uploadedTrack.uuid) {
      handlePlayPauseAction();
    } else {
      playNewTrackListFromTrackUuid(uploadedTrack, "me");
    }
  };

  return (
    <Page title="My Library" dataPage="me-uploaded-library">
      <div className="uploaded-library">
        <UploadButtons onFileChange={handleFileChange} />
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
          <table className="w-full divide-y divide-gray-300" style={{ tableLayout: "fixed" }}>
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                  style={{ width: "8%" }}
                >
                  #
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  style={{ width: "35%" }}
                >
                  Title
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  style={{ width: "15%" }}
                >
                  Artist
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                  style={{ width: "15%" }}
                >
                  Album
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell"
                  style={{ width: "10%" }}
                >
                  Genre
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell"
                  style={{ width: "8%" }}
                >
                  Rating
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell"
                  style={{ width: "8%" }}
                >
                  <div className="flex justify-center items-center">
                    <FaRegClock />
                  </div>
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell"
                  style={{ width: "6%" }}
                >
                  Format
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden xl:table-cell"
                  style={{ width: "8%" }}
                >
                  Bitrate
                </th>
                <th
                  className="uploaded-library-item px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider hidden xl:table-cell"
                  style={{ width: "6%" }}
                >
                  Plays
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uploadedTracks.map((uploadedTrack, index) => (
                <tr key={uploadedTrack.uuid} className="hover:bg-gray-50 group">
                  <td className="uploaded-library-item px-2 sm:px-3 py-2 text-center" style={{ width: "8%" }}>
                    <TrackPositionPlayPause
                      position={index + 1}
                      uuid={uploadedTrack.uuid}
                      handlePlayPauseClick={() => handlePlayPauseClick(uploadedTrack)}
                    />
                  </td>
                  <td className="uploaded-library-item px-2 sm:px-3 py-2 text-sm truncate" style={{ width: "35%" }}>
                    <div className="truncate" title={uploadedTrack.title}>
                      {uploadedTrack.title}
                    </div>
                    <div className="text-xs text-gray-500 sm:hidden">
                      {getArtistsDisplay(uploadedTrack.artists)}` • {uploadedTrack.album?.name ?? ""}`
                    </div>
                  </td>
                  <td
                    className="uploaded-library-item px-2 sm:px-3 py-2 text-sm truncate hidden sm:table-cell"
                    style={{ width: "15%" }}
                  >
                    <div className="truncate" title={getArtistsDisplay(uploadedTrack.artists)}>
                      {getArtistsDisplay(uploadedTrack.artists)}
                    </div>
                  </td>
                  <td
                    className="uploaded-library-item px-2 sm:px-3 py-2 text-sm truncate hidden md:table-cell"
                    style={{ width: "15%" }}
                  >
                    <div className="truncate" title={uploadedTrack.album ? uploadedTrack.album.name : ""}>
                      {uploadedTrack.album ? uploadedTrack.album.name : ""}
                    </div>
                  </td>
                  <td
                    className="uploaded-library-item px-2 sm:px-3 py-2 text-sm truncate hidden lg:table-cell"
                    style={{ width: "10%" }}
                  >
                    <div className="truncate" title={uploadedTrack.genre ? uploadedTrack.genre.name : ""}>
                      {uploadedTrack.genre ? uploadedTrack.genre.name : ""}
                    </div>
                  </td>
                  <td
                    className="uploaded-library-item px-2 sm:px-3 py-2 text-center hidden sm:table-cell"
                    style={{ width: "8%" }}
                  >
                    <Rating
                      rating={uploadedTrack.rating}
                      handleChange={() => {
                        return;
                      }}
                    />
                  </td>
                  <td className="uploaded-library-item px-2 sm:px-3 py-2 text-sm text-center" style={{ width: "8%" }}>
                    {formatTime(uploadedTrack.file.durationInSec)}
                  </td>
                  <td
                    className="uploaded-library-item px-2 sm:px-3 py-2 text-sm text-center hidden lg:table-cell"
                    style={{ width: "6%" }}
                  >
                    {uploadedTrack.file.extension.replace(".", "")}
                  </td>
                  <td
                    className="uploaded-library-item px-2 sm:px-3 py-2 text-sm text-center hidden xl:table-cell"
                    style={{ width: "8%" }}
                  >
                    {uploadedTrack.file.bitrateInKbps} kbps
                  </td>
                  <td
                    className="uploaded-library-item px-2 sm:px-3 py-2 text-sm text-center hidden xl:table-cell"
                    style={{ width: "6%" }}
                  >
                    {uploadedTrack.playCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}
