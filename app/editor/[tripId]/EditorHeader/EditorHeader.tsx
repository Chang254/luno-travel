"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SaveButton from "./SaveButton";
import { styles } from "./EditorHeader.styles";

interface EditorHeaderProps {
  title: string;
  tripId: string;
}

export default function EditorHeader({ title, tripId }: EditorHeaderProps) {
  return (
    <header className={styles.header}>
      <Button variant="ghost" size="icon" asChild aria-label="Back to home">
        <Link href="/">
          <ArrowLeft />
        </Link>
      </Button>
      <h1 className={styles.title}>{title}</h1>
      <SaveButton tripId={tripId} />
    </header>
  );
}
