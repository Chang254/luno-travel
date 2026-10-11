"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { styles } from "./EditorHeader.styles";

export default function EditorHeader() {
  return (
    <header className={styles.header}>
      <Button variant="ghost" size="icon" asChild aria-label="Back to home">
        <Link href="/">
          <ArrowLeft />
        </Link>
      </Button>
      <h1 className={styles.title}>Editor</h1>
    </header>
  );
}
