"use client";

import { useCallback, useEffect, useState } from "react";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
  type RangeSelection,
} from "lexical";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  type LucideIcon,
} from "lucide-react";

export type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "number"
  | "quote";

export interface BlockTypeOption {
  type: BlockType;
  label: string;
  icon: LucideIcon;
}

export const BLOCK_TYPE_OPTIONS: BlockTypeOption[] = [
  { type: "paragraph", label: "Normal", icon: Pilcrow },
  { type: "h1", label: "Heading 1", icon: Heading1 },
  { type: "h2", label: "Heading 2", icon: Heading2 },
  { type: "h3", label: "Heading 3", icon: Heading3 },
  { type: "bullet", label: "Bulleted List", icon: List },
  { type: "number", label: "Numbered List", icon: ListOrdered },
  { type: "quote", label: "Quote", icon: Quote },
];

/** Reads the block type (heading, list, quote, or paragraph) of the selection's nearest top-level element. */
export function getBlockType(selection: RangeSelection): BlockType {
  const anchorNode = selection.anchor.getNode();
  const element =
    anchorNode.getKey() === "root"
      ? anchorNode
      : $findMatchingParent(anchorNode, (node) => {
          const parent = node.getParent();
          return parent !== null && $isRootOrShadowRoot(parent);
        });

  if (element === null) {
    return "paragraph";
  }

  if ($isListNode(element)) {
    const nearestList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
    const listType = nearestList ? nearestList.getListType() : element.getListType();
    return listType === "number" ? "number" : "bullet";
  }

  if ($isHeadingNode(element)) {
    const tag = element.getTag();
    return tag === "h1" || tag === "h2" || tag === "h3" ? tag : "paragraph";
  }

  if ($isQuoteNode(element)) {
    return "quote";
  }

  return "paragraph";
}

/**
 * Converts the selection's blocks to `blockType`, or back to a plain paragraph
 * if the selection is already that type.
 */
export function formatBlock(
  editor: LexicalEditor,
  blockType: BlockType,
  currentBlockType: BlockType,
) {
  const nextBlockType = currentBlockType === blockType ? "paragraph" : blockType;
  const isCurrentlyList = currentBlockType === "bullet" || currentBlockType === "number";

  if (nextBlockType === "bullet" || nextBlockType === "number") {
    editor.dispatchCommand(
      nextBlockType === "bullet"
        ? INSERT_UNORDERED_LIST_COMMAND
        : INSERT_ORDERED_LIST_COMMAND,
      undefined,
    );
    return;
  }

  if (isCurrentlyList) {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }

  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }

    switch (nextBlockType) {
      case "h1":
      case "h2":
      case "h3":
        $setBlocksType(selection, () => $createHeadingNode(nextBlockType));
        break;
      case "quote":
        $setBlocksType(selection, () => $createQuoteNode());
        break;
      default:
        $setBlocksType(selection, () => $createParagraphNode());
    }
  });
}

/** Tracks the selection's block type and exposes the action to change it. */
export function useBlockType() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  useEffect(() => {
    const syncState = () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setBlockType(getBlockType(selection));
      }
    };

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(syncState);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          syncState();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  const setType = useCallback(
    (nextBlockType: BlockType) => {
      formatBlock(editor, nextBlockType, blockType);
    },
    [editor, blockType],
  );

  return { blockType, setType };
}
