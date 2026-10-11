"use client";

import {
  $create,
  $getDocument,
  $getState,
  $setState,
  createState,
  DecoratorNode,
  numberValue,
  stringValue,
} from "lexical";
import type { ElementFormatType, LexicalNode } from "lexical";
import type { JSX } from "react";

import ImageComponent from "./ImageComponent";
import { styles } from "./ImageNode.styles";

// TODO: Hardcoded placeholder image. Replace with a real uploaded image once
// backend storage (likely Supabase Storage, see lib/supabase/client.ts) is
// wired up — src/alt will need to become per-node data instead of constants.
export const PRESET_IMAGE_SRC = "https://placehold.co/800x450?text=Travel+Photo";
export const PRESET_IMAGE_ALT = "Placeholder travel photo";

export const MIN_IMAGE_WIDTH = 120;
export const MAX_IMAGE_WIDTH = 800;
const DEFAULT_IMAGE_WIDTH = 400;

export function clampImageWidth(width: number): number {
  return Math.min(MAX_IMAGE_WIDTH, Math.max(MIN_IMAGE_WIDTH, width));
}

const widthState = createState("width", {
  parse: numberValue(DEFAULT_IMAGE_WIDTH, {
    min: MIN_IMAGE_WIDTH,
    max: MAX_IMAGE_WIDTH,
    clamp: true,
    integer: true,
  }),
});

// Empty string matches ElementNode's own default ("" means "left"), so an
// image behaves the same as a freshly-inserted paragraph until aligned.
const alignState = createState("align", { parse: stringValue("") });

export class ImageNode extends DecoratorNode<JSX.Element> {
  $config() {
    return this.config("image", {
      extends: DecoratorNode,
      stateConfigs: [
        { flat: true, stateConfig: widthState },
        { flat: true, stateConfig: alignState },
      ],
    });
  }

  getWidth(): number {
    return $getState(this, widthState);
  }

  setWidth(width: number): this {
    return $setState(this, widthState, clampImageWidth(width));
  }

  getAlign(): ElementFormatType {
    return $getState(this, alignState) as ElementFormatType;
  }

  setAlign(align: ElementFormatType): this {
    return $setState(this, alignState, align);
  }

  createDOM(): HTMLElement {
    const element = $getDocument().createElement("div");
    element.className = styles.container;
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        nodeKey={this.getKey()}
        width={this.getWidth()}
        align={this.getAlign()}
      />
    );
  }
}

export function $createImageNode(): ImageNode {
  return $create(ImageNode);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
