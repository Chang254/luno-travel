"use client";

import { Bold } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useTextFormatState } from "../Toolbar.helpers";
import { styles } from "./BoldButton.styles";

export default function BoldButton() {
  const { isActive, toggle } = useTextFormatState("bold");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isActive}
      className={isActive ? styles.active : undefined}
      onClick={toggle}
      aria-label="Bold"
    >
      <Bold />
    </Button>
  );
}
