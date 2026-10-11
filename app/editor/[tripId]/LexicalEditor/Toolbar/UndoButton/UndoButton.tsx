"use client";

import { Undo } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCanUndo } from "./UndoButton.helpers";

export default function UndoButton() {
  const { canUndo, undo } = useCanUndo();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!canUndo}
      onClick={undo}
      aria-label="Undo"
    >
      <Undo />
    </Button>
  );
}
