"use client";

import { useRef } from "react";
import type { ChangeEvent } from "react";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import type { LexicalEditor } from "lexical";
import { ImageIcon, type LucideIcon } from "lucide-react";

import { useUploadTripImage } from "@/lib/api/trips";

import { $createImageNode, type ImageNodeInit } from "@/components/ImageNode";

export type InsertType = "image";

export interface InsertOption {
  type: InsertType;
  label: string;
  icon: LucideIcon;
}

/** Options shown in the "+ Insert" menu. Add new entries here as more insert types ship. */
export const INSERT_OPTIONS: InsertOption[] = [
  { type: "image", label: "Image", icon: ImageIcon },
];

/** Inserts a new image block as a sibling of the current block (does not replace it). */
export function insertImage(editor: LexicalEditor, image: ImageNodeInit): void {
  editor.update(() => {
    $insertNodeToNearestRoot($createImageNode(image));
  });
}

/** File name without its extension, used as the image's default alt text. */
export function getAltFromFileName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

/**
 * Backs the Image option: opens a hidden file input, uploads the chosen file
 * to the trip's storage folder, then inserts an image node pointing at it.
 */
export function useInsertImage(editor: LexicalEditor, tripId: string | undefined) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: upload, isPending: isUploading } = useUploadTripImage();

  function openFilePicker() {
    inputRef.current?.click();
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires `change`.
    event.target.value = "";
    if (!file || !tripId) return;

    try {
      const path = await upload({ tripId, file });
      insertImage(editor, { src: path, alt: getAltFromFileName(file.name) });
    } catch (error) {
      //TODO: Surface upload failures in the UI
      console.error(error);
    }
  }

  return { inputRef, openFilePicker, onFileChange, isUploading };
}
