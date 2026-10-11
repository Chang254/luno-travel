import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  createEditor,
  type LexicalEditor,
} from "lexical";

import { ImageNode, $isImageNode } from "../../ImageNode";
import { getAltFromFileName, insertImage } from "./InsertDropdown.helpers";

jest.mock("@/lib/api/trips");

const image = { src: "user-1/trip-1/abc.png", alt: "kyoto" };

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

    insertImage(editor, image);

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

    insertImage(editor, image);
    insertImage(editor, image);

    const imageCount = editor.read(
      () => $getRoot().getChildren().filter($isImageNode).length,
    );
    expect(imageCount).toBe(2);
  });
});

describe("getAltFromFileName", () => {
  it("strips only the final extension", () => {
    expect(getAltFromFileName("kyoto.temple.jpg")).toBe("kyoto.temple");
    expect(getAltFromFileName("no-extension")).toBe("no-extension");
  });
});
