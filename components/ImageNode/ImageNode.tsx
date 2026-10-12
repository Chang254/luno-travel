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

/** Object path in the trip images bucket, not a full URL (see `getTripImageUrl`). */
const srcState = createState("src", { parse: stringValue("") });
const altState = createState("alt", { parse: stringValue("") });

// Empty string matches ElementNode's own default ("" means "left"), so an
// image behaves the same as a freshly-inserted paragraph until aligned.
const alignState = createState("align", { parse: stringValue("") });

export class ImageNode extends DecoratorNode<JSX.Element> {
  $config() {
    return this.config("image", {
      extends: DecoratorNode,
      stateConfigs: [
        { flat: true, stateConfig: srcState },
        { flat: true, stateConfig: altState },
        { flat: true, stateConfig: widthState },
        { flat: true, stateConfig: alignState },
      ],
    });
  }

  getSrc(): string {
    return $getState(this, srcState);
  }

  setSrc(src: string): this {
    return $setState(this, srcState, src);
  }

  getAlt(): string {
    return $getState(this, altState);
  }

  setAlt(alt: string): this {
    return $setState(this, altState, alt);
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
        src={this.getSrc()}
        alt={this.getAlt()}
        width={this.getWidth()}
        align={this.getAlign()}
      />
    );
  }
}

export interface ImageNodeInit {
  src: string;
  alt: string;
}

export function $createImageNode({ src, alt }: ImageNodeInit): ImageNode {
  return $create(ImageNode).setSrc(src).setAlt(alt);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
