import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { styles } from "./PreviewBar.styles";

interface PreviewBarProps {
  tripId: string;
}

export default function PreviewBar({ tripId }: PreviewBarProps) {
  return (
    <div className={styles.bar}>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/editor/${tripId}`}>
          <ArrowLeft />
          Back to editor
        </Link>
      </Button>
      <Badge variant="secondary">Preview</Badge>
      <span className={styles.label}>Only you can see this draft</span>
    </div>
  );
}
