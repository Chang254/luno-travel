"use client";

import { Underline } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useTextFormatState } from "../Toolbar.helpers";
import { styles } from "./UnderlineButton.styles";

export default function UnderlineButton() {
  const { isActive, toggle } = useTextFormatState("underline");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isActive}
      className={isActive ? styles.active : undefined}
      onClick={toggle}
      aria-label="Underline"
    >
      <Underline />
    </Button>
  );
}
