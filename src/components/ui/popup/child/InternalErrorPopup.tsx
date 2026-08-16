"use client";

import { ComponentProps } from "react";
import { InternalErrorPopup as AppKitInternalErrorPopup } from "@behindthemusictree/app-kit/popup";

type InternalErrorPopupProps = Omit<ComponentProps<typeof AppKitInternalErrorPopup>, "contactEmail">;

export default function InternalErrorPopup(props: InternalErrorPopupProps) {
  return <AppKitInternalErrorPopup {...props} contactEmail={process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null} />;
}
