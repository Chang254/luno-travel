"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FONT_FAMILY_OPTIONS, useFontFamily } from "./FontSelector.helpers";
import { styles } from "./FontSelector.styles";

export default function FontSelector() {
  const { fontFamily, setFamily } = useFontFamily();

  const activeOption =
    FONT_FAMILY_OPTIONS.find((option) => option.value === fontFamily) ??
    FONT_FAMILY_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={styles.trigger}>
          {activeOption.label}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {FONT_FAMILY_OPTIONS.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            style={{ fontFamily: value }}
            onSelect={() => setFamily(value)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
