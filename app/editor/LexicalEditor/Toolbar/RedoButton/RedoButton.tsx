"use client";

import { Redo } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCanRedo } from "./RedoButton.helpers";

export default function RedoButton() {
  const { canRedo, redo } = useCanRedo();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!canRedo}
      onClick={redo}
      aria-label="Redo"
    >
      <Redo />
    </Button>
  );
}
