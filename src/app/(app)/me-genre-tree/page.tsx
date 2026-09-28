"use client";

import { useCallback, useEffect, useRef } from "react";
import { z } from "zod";

import { usePopup } from "@behindthemusictree/app-kit/popup";
import {
  useCreateGenre,
  useUpdateGenre,
  GenreTreeView,
  CriteriaMinimum,
  CriteriaOverviewSchema,
} from "@behindthemusictree/app-kit/genre-tree";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import Page from "@components/ui/Page";
import { getBackendBaseUrl } from "@lib/site-urls";

const HearCriteriaOverviewSchema = CriteriaOverviewSchema.extend({ uploadedTracksArchivedCount: z.number() });

function renderArchivedTracks(overview: z.infer<typeof HearCriteriaOverviewSchema>) {
  if (overview.uploadedTracksArchivedCount === 0) return null;
  return (
    <div className="gtv-info-panel-children">
      <span className="gtv-info-panel-children-title">Archived tracks</span>
      <p>{overview.uploadedTracksArchivedCount}</p>
    </div>
  );
}

export default function GenreTreePage() {
  const { mutate: createGenre, formErrors } = useCreateGenre("me", getBackendBaseUrl);
  const { renameGenre, formErrors: renameFormErrors } = useUpdateGenre("me", getBackendBaseUrl);
  const { showPopup, hidePopup } = usePopup();

  const showCriteriaCreationPopup = useCallback(
    (parent: CriteriaMinimum | null = null) => {
      showPopup(
        <GenreCreationPopup
          parent={parent}
          onSubmit={({ name, parent }: { name: string; parent?: string }) => {
            createGenre({ name, parent });
            hidePopup();
          }}
          onClose={hidePopup}
          formErrors={formErrors}
        />,
      );
    },
    [formErrors, createGenre, hidePopup, showPopup],
  );

  const showGenreRenamePopup = useCallback(
    (genre: CriteriaMinimum) => {
      showPopup(
        <GenreRenamePopup
          genre={genre}
          onSubmit={({ name }: { name: string }) => {
            renameGenre(genre.uuid, name);
            hidePopup();
          }}
          onClose={hidePopup}
          formErrors={renameFormErrors}
        />,
      );
    },
    [renameFormErrors, renameGenre, hidePopup, showPopup],
  );

  const previousErrorsRef = useRef<typeof formErrors>([]);

  useEffect(() => {
    if (
      formErrors &&
      formErrors.length > 0 &&
      (previousErrorsRef.current.length === 0 ||
        JSON.stringify(previousErrorsRef.current) !== JSON.stringify(formErrors))
    ) {
      showCriteriaCreationPopup();
    }
    previousErrorsRef.current = formErrors || [];
  }, [formErrors, showCriteriaCreationPopup]);

  return (
    <Page title="MyMusicTree" dataPage="me-genre-tree">
      <GenreTreeView
        scope="me"
        handleGenreCreationAction={showCriteriaCreationPopup}
        handleGenreRenameAction={showGenreRenamePopup}
        getBackendBaseUrl={getBackendBaseUrl}
        criteriaOverviewSchema={HearCriteriaOverviewSchema}
        renderGenreDetailExtras={renderArchivedTracks}
      />
    </Page>
  );
}
