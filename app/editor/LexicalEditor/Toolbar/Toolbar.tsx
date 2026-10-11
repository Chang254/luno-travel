import Divider from "@/components/Divider/Divider";
import { AlignCenterButton } from "./AlignCenterButton";
import { AlignJustifyButton } from "./AlignJustifyButton";
import { AlignLeftButton } from "./AlignLeftButton";
import { AlignRightButton } from "./AlignRightButton";
import { BlockTypeDropdown } from "./BlockTypeDropdown";
import { BoldButton } from "./BoldButton";
import { ItalicButton } from "./ItalicButton";
import { RedoButton } from "./RedoButton";
import { styles } from "./Toolbar.styles";
import { UnderlineButton } from "./UnderlineButton";
import { UndoButton } from "./UndoButton";

export default function Toolbar() {
  return (
    <div className={styles.toolbar}>
      <UndoButton />
      <RedoButton />

      <Divider />

      <BlockTypeDropdown />

      <Divider />

      <BoldButton />
      <ItalicButton />
      <UnderlineButton />

      <Divider />

      <AlignLeftButton />
      <AlignCenterButton />
      <AlignRightButton />
      <AlignJustifyButton />
    </div>
  );
}
