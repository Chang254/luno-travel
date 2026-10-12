"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSaveDraft } from "../../EditorSaveStore.helpers";
import { styles } from "./PreviewButton.styles";

interface PreviewButtonProps {
  tripId: string;
}

/** Opens the draft in the reader layout, saving first so the preview is current. */
export default function PreviewButton({ tripId }: PreviewButtonProps) {
  const router = useRouter();
  const { saveDraft, isSaving } = useSaveDraft(tripId);

  const handlePreview = async () => {
    try {
      await saveDraft();
    } catch {
      return;
    }
    router.push(`/trips/${tripId}/preview`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={styles.button}
      onClick={handlePreview}
      disabled={isSaving}
    >
      <Eye />
      Preview
    </Button>
  );
}
