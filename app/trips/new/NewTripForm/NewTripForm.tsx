"use client";

import { FormProvider } from "react-hook-form";

import TripDetailsFields from "@/components/TripDetailsFields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useNewTripForm } from "./NewTripForm.helpers";
import { styles } from "./NewTripForm.styles";

export default function NewTripForm() {
  const { form, onSubmit, isPending, isError } = useNewTripForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>New trip</CardTitle>
        <CardDescription>Give your trip a name and a place, and optionally a cover photo.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form className={styles.form} onSubmit={onSubmit}>
            <TripDetailsFields idPrefix="new-trip" autoFocusTitle />

            {isError && (
              <p role="alert" className={styles.error}>
                Couldn&apos;t create the trip. Please try again.
              </p>
            )}

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={!form.formState.isValid || isPending}
            >
              {isPending && <Spinner />}
              {isPending ? "Creating…" : "Create trip"}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
