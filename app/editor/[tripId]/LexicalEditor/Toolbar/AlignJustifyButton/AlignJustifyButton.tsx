"use client";

import { AlignJustify } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useElementFormatState } from "../Toolbar.helpers";
import { styles } from "./AlignJustifyButton.styles";

export default function AlignJustifyButton() {
  const { isActive, align } = useElementFormatState("justify");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isActive}
      className={isActive ? styles.active : undefined}
      onClick={align}
      aria-label="Justify"
    >
      <AlignJustify />
    </Button>
  );
}
