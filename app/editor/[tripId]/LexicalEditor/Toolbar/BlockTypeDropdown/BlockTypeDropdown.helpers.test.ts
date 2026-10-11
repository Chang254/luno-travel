import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  createEditor,
  type LexicalEditor,
  type RangeSelection,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode, registerList } from "@lexical/list";

import { formatBlock, getBlockType } from "./BlockTypeDropdown.helpers";

/** Mirrors `LexicalEditor.tsx`'s setup (nodes + list support) without React. */
function createTestEditor(): LexicalEditor {
  const editor = createEditor({
    namespace: "test",
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error) => {
      throw error;
    },
  });
  registerList(editor);
  return editor;
}

/** Seeds the editor with a paragraph of text and selects it, then runs `read`. */
function withSelectedText<T>(
  editor: LexicalEditor,
  text: string,
  read: () => T,
): T {
  editor.update(
    () => {
      const paragraph = $createParagraphNode();
      const textNode = $createTextNode(text);
      paragraph.append(textNode);
      $getRoot().clear().append(paragraph);
      textNode.select(0, textNode.getTextContentSize());
    },
    { discrete: true },
  );

  return editor.read(read);
}

function readSelectionOrThrow<T>(callback: (selection: RangeSelection) => T): T {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    throw new Error("Expected a range selection");
  }
  return callback(selection);
}

describe("getBlockType", () => {
  it("defaults to paragraph for plain text", () => {
    const editor = createTestEditor();

    const blockType = withSelectedText(editor, "hello", () =>
      readSelectionOrThrow(getBlockType),
    );

    expect(blockType).toBe("paragraph");
  });

  it("detects a heading after formatBlock converts the paragraph", () => {
    const editor = createTestEditor();
    withSelectedText(editor, "hello", () => undefined);

    formatBlock(editor, "h1", "paragraph");

    const blockType = editor.read(() => readSelectionOrThrow(getBlockType));

    expect(blockType).toBe("h1");
  });

  it("detects a bulleted list after formatBlock inserts one", () => {
    const editor = createTestEditor();
    withSelectedText(editor, "hello", () => undefined);

    formatBlock(editor, "bullet", "paragraph");

    const blockType = editor.read(() => readSelectionOrThrow(getBlockType));

    expect(blockType).toBe("bullet");
  });

  it("detects a quote block after formatBlock converts the paragraph", () => {
    const editor = createTestEditor();
    withSelectedText(editor, "hello", () => undefined);

    formatBlock(editor, "quote", "paragraph");

    const blockType = editor.read(() => readSelectionOrThrow(getBlockType));

    expect(blockType).toBe("quote");
  });
});

describe("formatBlock", () => {
  it("toggles back to paragraph when the current block type is reapplied", () => {
    const editor = createTestEditor();
    withSelectedText(editor, "hello", () => undefined);

    formatBlock(editor, "h1", "paragraph");
    formatBlock(editor, "h1", "h1");

    const blockType = editor.read(() => readSelectionOrThrow(getBlockType));

    expect(blockType).toBe("paragraph");
  });
});
