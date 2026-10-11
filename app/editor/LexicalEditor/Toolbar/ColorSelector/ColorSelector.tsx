"use client";

import { ChevronDown, PaintBucketIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { ColorPicker } from "./ColorPicker";
import { TEXT_COLOR_OPTIONS, useTextColor } from "./ColorSelector.helpers";
import { styles } from "./ColorSelector.styles";

export default function ColorSelector() {
  const { color, setColor } = useTextColor();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={styles.trigger} aria-label="Text color">
          <PaintBucketIcon className={styles.icon} style={{ color }} />
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={styles.content}>
        <div className={styles.presetRow}>
          {TEXT_COLOR_OPTIONS.map(({ value, label }) => (
            <DropdownMenuItem
              key={value}
              aria-label={label}
              onSelect={() => setColor(value)}
              className={cn(styles.preset, color === value && styles.presetActive)}
              style={{ backgroundColor: value }}
            />
          ))}
        </div>
        <DropdownMenuSeparator />
        <ColorPicker color={color} onChange={setColor} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
