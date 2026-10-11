"use client";

import Divider from "@/components/Divider/Divider";
import { AlignCenterButton } from "./AlignCenterButton";
import { AlignJustifyButton } from "./AlignJustifyButton";
import { AlignLeftButton } from "./AlignLeftButton";
import { AlignRightButton } from "./AlignRightButton";
import { BlockTypeDropdown } from "./BlockTypeDropdown";
import { BoldButton } from "./BoldButton";
import { ColorSelector } from "./ColorSelector";
import { FontSelector } from "./FontSelector";
import { InsertDropdown } from "./InsertDropdown";
import { ItalicButton } from "./ItalicButton";
import { RedoButton } from "./RedoButton";
import { useSyncToolbarState } from "./Toolbar.helpers";
import { styles } from "./Toolbar.styles";
import { UnderlineButton } from "./UnderlineButton";
import { UndoButton } from "./UndoButton";

export default function Toolbar() {
  useSyncToolbarState();

  return (
    <div className={styles.toolbar}>
      <UndoButton />
      <RedoButton />

      <Divider />

      <BlockTypeDropdown />
      <FontSelector />

      <Divider />

      <BoldButton />
      <ItalicButton />
      <UnderlineButton />
      <ColorSelector />

      <Divider />

      <AlignLeftButton />
      <AlignCenterButton />
      <AlignRightButton />
      <AlignJustifyButton />

      <Divider />

      <InsertDropdown />
    </div>
  );
}
