"use client";

import { ComponentProps } from "react";
import { AuthPopup as AppKitAuthPopup } from "@behindthemusictree/app-kit/popup";

type AuthPopupProps = Omit<ComponentProps<typeof AppKitAuthPopup>, "spotifyOnlyDescription" | "defaultDescription">;

const spotifyOnlyDescription = (
  <>
    <b>My Library</b> requires Spotify to access your saved tracks and playlists.
  </>
);

const defaultDescription = (
  <>
    <b>HearTheMusicTree</b> requires sign-in to access your library and playlists
  </>
);

export default function AuthPopup(props: AuthPopupProps) {
  return (
    <AppKitAuthPopup {...props} spotifyOnlyDescription={spotifyOnlyDescription} defaultDescription={defaultDescription} />
  );
}
