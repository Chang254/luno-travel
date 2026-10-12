"use client";

import Link from "next/link";
import { ChevronDown, Globe } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  getPublicTripPath,
  getPublishConfirmation,
  getPublishLabel,
  usePublishActions,
} from "./PublishButton.helpers";
import { styles } from "./PublishButton.styles";

interface PublishButtonProps {
  tripId: string;
  /** Server-loaded status, used until the client query resolves. */
  initiallyPublished: boolean;
}

export default function PublishButton({ tripId, initiallyPublished }: PublishButtonProps) {
  const { isPublished, isPublishing, isBusy, publish, unpublish, copyLink } = usePublishActions(
    tripId,
    initiallyPublished,
  );
  const confirmation = getPublishConfirmation(isPublished);

  return (
    <div className={styles.container}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" className={styles.button} disabled={isBusy}>
            <Globe />
            {getPublishLabel(isPublished, isPublishing)}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmation.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={publish}>{confirmation.action}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isPublished && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Publishing options" disabled={isBusy}>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={getPublicTripPath(tripId)} target="_blank">
                View live
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={copyLink}>Copy link</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={unpublish}>Unpublish</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
