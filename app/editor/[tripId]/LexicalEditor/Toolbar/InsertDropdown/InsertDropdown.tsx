"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { IMAGE_EXTENSIONS } from "@/server/models/tripImages.types";

import { INSERT_OPTIONS, type InsertType, useInsertImage } from "./InsertDropdown.helpers";
import { styles } from "./InsertDropdown.styles";

interface InsertDropdownProps {
  /** Required for uploads; without it the Image option is disabled. */
  tripId?: string;
}

export default function InsertDropdown({ tripId }: InsertDropdownProps) {
  const [editor] = useLexicalComposerContext();
  const { inputRef, openFilePicker, onFileChange, isUploading } = useInsertImage(editor, tripId);

  const onSelect: Record<InsertType, () => void> = { image: openFilePicker };
  const isDisabled: Record<InsertType, boolean> = { image: !tripId };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={styles.trigger} disabled={isUploading}>
            <Plus />
            {isUploading ? "Uploading…" : "Insert"}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {INSERT_OPTIONS.map(({ type, label, icon: Icon }) => (
            <DropdownMenuItem
              key={type}
              disabled={isDisabled[type]}
              onSelect={onSelect[type]}
            >
              <Icon />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={inputRef}
        type="file"
        accept={Object.keys(IMAGE_EXTENSIONS).join(",")}
        aria-label="Upload image"
        className={styles.fileInput}
        onChange={onFileChange}
      />
    </>
  );
}
