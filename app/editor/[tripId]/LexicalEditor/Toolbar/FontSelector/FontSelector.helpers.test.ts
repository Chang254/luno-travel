import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  createEditor,
  type LexicalEditor,
} from "lexical";

import { DEFAULT_FONT_FAMILY, getFontFamily, setFontFamily } from "./FontSelector.helpers";

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

describe("getFontFamily", () => {
  it("defaults to Arial for plain text", () => {
    const editor = createTestEditor();

    const fontFamily = withSelectedText(editor, "hello", () =>
      getFontFamily($getSelection()),
    );

    expect(fontFamily).toBe(DEFAULT_FONT_FAMILY);
  });

  it("reads the font family applied by setFontFamily", () => {
    const editor = createTestEditor();
    withSelectedText(editor, "hello", () => undefined);

    setFontFamily(editor, "Georgia");

    const fontFamily = editor.read(() => getFontFamily($getSelection()));

    expect(fontFamily).toBe("Georgia");
  });
});
