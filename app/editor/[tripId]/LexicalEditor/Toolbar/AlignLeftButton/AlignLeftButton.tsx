"use client";

import { AlignLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useElementFormatState } from "../Toolbar.helpers";
import { styles } from "./AlignLeftButton.styles";

export default function AlignLeftButton() {
  const { isActive, align } = useElementFormatState("left");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isActive}
      className={isActive ? styles.active : undefined}
      onClick={align}
      aria-label="Align left"
    >
      <AlignLeft />
    </Button>
  );
}
