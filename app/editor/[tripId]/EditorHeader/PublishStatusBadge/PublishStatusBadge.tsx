"use client";

import { Badge } from "@/components/ui/badge";

import { useIsPublished } from "../EditorHeader.helpers";
import { styles } from "./PublishStatusBadge.styles";

interface PublishStatusBadgeProps {
  tripId: string;
  /** Server-loaded status, used until the client query resolves. */
  initiallyPublished: boolean;
}

export default function PublishStatusBadge({ tripId, initiallyPublished }: PublishStatusBadgeProps) {
  const isPublished = useIsPublished(tripId, initiallyPublished);

  return (
    <Badge
      variant={isPublished ? "default" : "secondary"}
      className={isPublished ? styles.published : styles.draft}
    >
      {isPublished ? "Published" : "Draft"}
    </Badge>
  );
}
