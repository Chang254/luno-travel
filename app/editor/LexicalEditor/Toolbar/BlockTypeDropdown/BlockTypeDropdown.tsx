"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BLOCK_TYPE_OPTIONS, useBlockType } from "./BlockTypeDropdown.helpers";
import { styles } from "./BlockTypeDropdown.styles";

export default function BlockTypeDropdown() {
  const { blockType, setType } = useBlockType();

  const activeOption =
    BLOCK_TYPE_OPTIONS.find((option) => option.type === blockType) ??
    BLOCK_TYPE_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={styles.trigger}>
          <ActiveIcon />
          {activeOption.label}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {BLOCK_TYPE_OPTIONS.map(({ type, label, icon: Icon }) => (
          <DropdownMenuItem key={type} onSelect={() => setType(type)}>
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
