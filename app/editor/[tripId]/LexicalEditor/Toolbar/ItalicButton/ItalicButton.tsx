"use client";

import { Italic } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useTextFormatState } from "../Toolbar.helpers";
import { styles } from "./ItalicButton.styles";

export default function ItalicButton() {
  const { isActive, toggle } = useTextFormatState("italic");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isActive}
      className={isActive ? styles.active : undefined}
      onClick={toggle}
      aria-label="Italic"
    >
      <Italic />
    </Button>
  );
}
