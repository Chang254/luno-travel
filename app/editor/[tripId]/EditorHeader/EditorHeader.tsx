"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PreviewButton from "./PreviewButton";
import PublishButton from "./PublishButton";
import PublishStatusBadge from "./PublishStatusBadge";
import SaveButton from "./SaveButton";
import { styles } from "./EditorHeader.styles";

interface EditorHeaderProps {
  title: string;
  tripId: string;
  isPublished: boolean;
}

export default function EditorHeader({ title, tripId, isPublished }: EditorHeaderProps) {
  return (
    <header className={styles.header}>
      <Button variant="ghost" size="icon" asChild aria-label="Back to home">
        <Link href="/">
          <ArrowLeft />
        </Link>
      </Button>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>{title}</h1>
        <PublishStatusBadge tripId={tripId} initiallyPublished={isPublished} />
      </div>
      <SaveButton tripId={tripId} />
      <PreviewButton tripId={tripId} />
      <PublishButton tripId={tripId} initiallyPublished={isPublished} />
    </header>
  );
}
