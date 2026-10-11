import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  createEditor,
  type LexicalEditor,
} from "lexical";

import { DEFAULT_TEXT_COLOR, getTextColor, setTextColor } from "./ColorSelector.helpers";

/** Mirrors `LexicalEditor.tsx`'s setup without React. */
function createTestEditor(): LexicalEditor {
  return createEditor({
    namespace: "test",
    onError: (error) => {
      throw error;
    },
  });
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

describe("getTextColor", () => {
  it("defaults to black for plain text", () => {
    const editor = createTestEditor();

    const color = withSelectedText(editor, "hello", () => getTextColor($getSelection()));

    expect(color).toBe(DEFAULT_TEXT_COLOR);
  });

  it("reads the color applied by setTextColor", () => {
    const editor = createTestEditor();
    withSelectedText(editor, "hello", () => undefined);

    setTextColor(editor, "#1971c2");

    const color = editor.read(() => getTextColor($getSelection()));

    expect(color).toBe("#1971c2");
  });
});
