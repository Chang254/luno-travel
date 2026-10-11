"use client";

import { AlignCenter } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useElementFormatState } from "../Toolbar.helpers";
import { styles } from "./AlignCenterButton.styles";

export default function AlignCenterButton() {
  const { isActive, align } = useElementFormatState("center");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isActive}
      className={isActive ? styles.active : undefined}
      onClick={align}
      aria-label="Align center"
    >
      <AlignCenter />
    </Button>
  );
}
