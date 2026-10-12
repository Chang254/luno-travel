"use client";

import { usePublishTrip, useUnpublishTrip } from "@/lib/api/trips";

import { useSaveDraft } from "../../EditorSaveStore.helpers";
import { useIsPublished } from "../EditorHeader.helpers";

export function getPublishLabel(isPublished: boolean, isPublishing: boolean): string {
  if (isPublishing) return "Publishing…";
  return isPublished ? "Update" : "Publish";
}

/** Copy for the confirmation dialog: first publish vs. replacing the live version. */
export function getPublishConfirmation(isPublished: boolean) {
  return isPublished
    ? {
        title: "Update the published trip?",
        description:
          "Readers will see your latest changes. Any unsaved changes will be saved first.",
        action: "Update",
      }
    : {
        title: "Publish this trip?",
        description:
          "Anyone with the link will be able to view it. Any unsaved changes will be saved first.",
        action: "Publish",
      };
}

export function getPublicTripPath(tripId: string): string {
  return `/trips/${tripId}`;
}

/** Publication state plus publish (saving unsaved edits first) and unpublish actions. */
export function usePublishActions(tripId: string, initiallyPublished: boolean) {
  const isPublished = useIsPublished(tripId, initiallyPublished);
  const { saveDraft, isSaving } = useSaveDraft(tripId);
  const { mutate: publishTrip, isPending: isPublishPending } = usePublishTrip();
  const { mutate: unpublishTrip, isPending: isUnpublishing } = useUnpublishTrip();

  const isPublishing = isSaving || isPublishPending;

  async function publish() {
    try {
      await saveDraft();
    } catch {
      return;
    }
    publishTrip({ id: tripId });
  }

  function unpublish() {
    unpublishTrip({ id: tripId });
  }

  function copyLink() {
    return navigator.clipboard.writeText(`${window.location.origin}${getPublicTripPath(tripId)}`);
  }

  return {
    isPublished,
    isPublishing,
    isBusy: isPublishing || isUnpublishing,
    publish,
    unpublish,
    copyLink,
  };
}
