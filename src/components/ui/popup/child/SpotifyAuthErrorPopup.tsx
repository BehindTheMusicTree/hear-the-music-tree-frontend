"use client";

import { ComponentProps } from "react";
import { SpotifyAuthErrorPopup as AppKitSpotifyAuthErrorPopup } from "@behindthemusictree/app-kit/popup";

type SpotifyAuthErrorPopupProps = Omit<ComponentProps<typeof AppKitSpotifyAuthErrorPopup>, "contactEmail">;

export default function SpotifyAuthErrorPopup(props: SpotifyAuthErrorPopupProps) {
  return <AppKitSpotifyAuthErrorPopup {...props} contactEmail={process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null} />;
}
