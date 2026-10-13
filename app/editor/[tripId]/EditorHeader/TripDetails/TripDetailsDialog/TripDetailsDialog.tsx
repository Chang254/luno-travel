"use client";

import { FormProvider } from "react-hook-form";
import { Pencil } from "lucide-react";

import TripDetailsFields from "@/components/TripDetailsFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { TripDetailsColumns } from "../TripDetails.helpers";
import { useTripDetailsDialog } from "./TripDetailsDialog.helpers";
import { styles } from "./TripDetailsDialog.styles";

interface TripDetailsDialogProps {
  tripId: string;
  details: TripDetailsColumns;
  /** Receives the saved trip. */
  onSaved: (saved: TripDetailsColumns) => void;
}

export default function TripDetailsDialog({ tripId, details, onSaved }: TripDetailsDialogProps) {
  const { open, changeOpen, form, onSubmit, isPending, isError } = useTripDetailsDialog({
    tripId,
    details,
    onSaved,
  });

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit trip details">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trip details</DialogTitle>
          <DialogDescription>Change your trip&apos;s title, place, or cover photo.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form className={styles.form} onSubmit={onSubmit}>
            <TripDetailsFields idPrefix="trip-details" />

            {isError && (
              <p role="alert" className={styles.error}>
                Couldn&apos;t save trip details. Please try again.
              </p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!form.formState.isValid || isPending}>
                {isPending && <Spinner />}
                {isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
