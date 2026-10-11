"use client";

import {
  $createNodeSelection,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  defineExtension,
  FORMAT_ELEMENT_COMMAND,
  isDOMNode,
} from "lexical";
import type { ElementFormatType } from "lexical";
import { mergeRegister } from "@lexical/utils";

import { $isImageNode, ImageNode } from "./ImageNode";

/**
 * Registers ImageNode plus the register-time behavior a plain `nodes` entry
 * can't provide: clicking an image selects it (a DecoratorNode has no
 * RangeSelection of its own), and `FORMAT_ELEMENT_COMMAND` (the toolbar's
 * align buttons) is intercepted for that selection, since the built-in
 * handler only ever formats `ElementNode` ancestors and an image's parent is
 * the root, which it deliberately skips.
 */
export const ImageExtension = defineExtension({
  name: "LunoEditor/Image",
  nodes: () => [ImageNode],
  register(editor) {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          if (!isDOMNode(event.target)) {
            return false;
          }
          const node = $getNearestNodeFromDOMNode(event.target);
          if (!$isImageNode(node)) {
            return false;
          }
          const selection = $createNodeSelection();
          selection.add(node.getKey());
          $setSelection(selection);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        FORMAT_ELEMENT_COMMAND,
        (format: ElementFormatType) => {
          const selection = $getSelection();
          if (!$isNodeSelection(selection)) {
            return false;
          }
          const imageNodes = selection.getNodes().filter($isImageNode);
          if (imageNodes.length === 0) {
            return false;
          }
          for (const imageNode of imageNodes) {
            imageNode.setAlign(format);
          }
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  },
});
