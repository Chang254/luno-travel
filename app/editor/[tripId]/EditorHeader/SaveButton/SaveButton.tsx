"use client";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpdateTripContent } from "@/lib/api/trips";
import { useEditorSaveStore } from "../../EditorSaveStore.store";
import { styles } from "./SaveButton.styles";

interface SaveButtonProps {
  tripId: string;
}

export default function SaveButton({ tripId }: SaveButtonProps) {
  const editor = useEditorSaveStore((state) => state.editor);
  const isDirty = useEditorSaveStore((state) => state.isDirty);
  const markSaved = useEditorSaveStore((state) => state.markSaved);
  const { mutate, isPending } = useUpdateTripContent();

  const handleSave = () => {
    if (!editor) return;

    const content = editor.getEditorState().toJSON();
    mutate({ id: tripId, content }, { onSuccess: () => markSaved() });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={styles.button}
      onClick={handleSave}
      disabled={!isDirty || isPending}
    >
      <Save />
      {isPending ? "Saving…" : "Save"}
    </Button>
  );
}
