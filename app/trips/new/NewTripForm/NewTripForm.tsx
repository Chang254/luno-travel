"use client";

import { useRef } from "react";
import { Controller } from "react-hook-form";
import { ImagePlus, X } from "lucide-react";

import CityPicker from "@/components/CityPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ACCEPTED_COVER_TYPES, useNewTripForm } from "./NewTripForm.helpers";
import { styles } from "./NewTripForm.styles";

export default function NewTripForm() {
  const { form, onSubmit, coverPreviewUrl, isPending, isError } = useNewTripForm();
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>New trip</CardTitle>
        <CardDescription>Give your trip a name and, if you like, a city and cover photo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className={styles.form} onSubmit={onSubmit}>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trip-title">Title</FieldLabel>
                <Input
                  {...field}
                  id="trip-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Summer in Kyoto"
                  maxLength={200}
                  autoFocus
                />
              </Field>
            )}
          />

          <Controller
            name="city"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="trip-city">City (optional)</FieldLabel>
                <CityPicker
                  id="trip-city"
                  value={field.value}
                  onSelect={field.onChange}
                  onClear={() => field.onChange(null)}
                />
              </Field>
            )}
          />

          <Controller
            name="coverImage"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trip-cover">Cover photo (optional)</FieldLabel>
                {coverPreviewUrl ? (
                  <div className={styles.preview}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                    <img src={coverPreviewUrl} alt="Cover preview" className={styles.previewImage} />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className={styles.removeButton}
                      onClick={() => field.onChange(null)}
                      aria-label="Remove cover photo"
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={coverInputRef}
                      id="trip-cover"
                      name={field.name}
                      type="file"
                      accept={ACCEPTED_COVER_TYPES}
                      className={styles.hiddenFileInput}
                      tabIndex={-1}
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.chooseCoverButton}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <ImagePlus />
                      Choose photo
                    </Button>
                  </>
                )}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

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
      </CardContent>
    </Card>
  );
}
