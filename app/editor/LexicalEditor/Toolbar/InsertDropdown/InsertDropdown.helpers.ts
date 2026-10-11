"use client";

import { $insertNodeToNearestRoot } from "@lexical/utils";
import type { LexicalEditor } from "lexical";
import { ImageIcon, type LucideIcon } from "lucide-react";

import { $createImageNode } from "../../ImageNode";

export type InsertType = "image";

export interface InsertOption {
  type: InsertType;
  label: string;
  icon: LucideIcon;
  insert: (editor: LexicalEditor) => void;
}

/** Inserts a new image block as a sibling of the current block (does not replace it). */
export function insertImage(editor: LexicalEditor): void {
  editor.update(() => {
    $insertNodeToNearestRoot($createImageNode());
  });
}

/** Options shown in the "+ Insert" menu. Add new entries here as more insert types ship. */
export const INSERT_OPTIONS: InsertOption[] = [
  { type: "image", label: "Image", icon: ImageIcon, insert: insertImage },
];
