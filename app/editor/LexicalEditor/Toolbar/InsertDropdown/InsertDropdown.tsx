"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { INSERT_OPTIONS } from "./InsertDropdown.helpers";
import { styles } from "./InsertDropdown.styles";

export default function InsertDropdown() {
  const [editor] = useLexicalComposerContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={styles.trigger}>
          <Plus />
          Insert
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {INSERT_OPTIONS.map(({ type, label, icon: Icon, insert }) => (
          <DropdownMenuItem key={type} onSelect={() => insert(editor)}>
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
