"use client";

import { AlignRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useElementFormatState } from "../Toolbar.helpers";
import { styles } from "./AlignRightButton.styles";

export default function AlignRightButton() {
  const { isActive, align } = useElementFormatState("right");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isActive}
      className={isActive ? styles.active : undefined}
      onClick={align}
      aria-label="Align right"
    >
      <AlignRight />
    </Button>
  );
}
