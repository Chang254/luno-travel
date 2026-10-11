import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  createEditor,
  type LexicalEditor,
} from "lexical";

import { ImageNode, $isImageNode } from "../../ImageNode";
import { insertImage } from "./InsertDropdown.helpers";

/** Mirrors `LexicalEditor.tsx`'s setup (nodes) without React. */
function createTestEditor(): LexicalEditor {
  return createEditor({
    namespace: "test",
    nodes: [ImageNode],
    onError: (error) => {
      throw error;
    },
  });
}

/** Seeds the editor with a paragraph of text and selects it. */
function seedSelectedText(editor: LexicalEditor, text: string): void {
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
}

describe("insertImage", () => {
  it("inserts a new image block without removing the current block's content", () => {
    const editor = createTestEditor();
    seedSelectedText(editor, "hello");

    insertImage(editor);

    const { hasText, hasImage } = editor.read(() => {
      const children = $getRoot().getChildren();
      return {
        hasText: children.some((child) => child.getTextContent() === "hello"),
        hasImage: children.some($isImageNode),
      };
    });
    expect(hasText).toBe(true);
    expect(hasImage).toBe(true);
  });

  it("is additive: inserting twice produces two image blocks", () => {
    const editor = createTestEditor();
    seedSelectedText(editor, "hello");

    insertImage(editor);
    insertImage(editor);

    const imageCount = editor.read(
      () => $getRoot().getChildren().filter($isImageNode).length,
    );
    expect(imageCount).toBe(2);
  });
});
