"use client";

import { useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ImagePlus, X } from "lucide-react";

import CityPicker from "@/components/CityPicker";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  ACCEPTED_COVER_TYPES,
  type TripDetailsFormInput,
  toCityPickerValue,
  useCoverPreviewUrl,
} from "./TripDetailsFields.helpers";
import { styles } from "./TripDetailsFields.styles";

interface TripDetailsFieldsProps {
  /** Prefix for input ids, so two forms on a page don't collide. */
  idPrefix: string;
  autoFocusTitle?: boolean;
}

/** Title, place and cover inputs; render inside a react-hook-form `FormProvider`. */
export default function TripDetailsFields({ idPrefix, autoFocusTitle }: TripDetailsFieldsProps) {
  const { control } = useFormContext<TripDetailsFormInput>();
  const coverImage = useWatch({ control, name: "coverImage" });
  const coverPreviewUrl = useCoverPreviewUrl(coverImage);
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}-title`}>Title</FieldLabel>
            <Input
              {...field}
              id={`${idPrefix}-title`}
              aria-invalid={fieldState.invalid}
              placeholder="Summer in Kyoto"
              maxLength={200}
              autoFocus={autoFocusTitle}
            />
          </Field>
        )}
      />

      <Controller
        name="city"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}-place`}>Place</FieldLabel>
            <CityPicker
              id={`${idPrefix}-place`}
              value={toCityPickerValue(field.value)}
              onSelect={field.onChange}
              onClear={() => field.onChange(null)}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="coverImage"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}-cover`}>Cover photo (optional)</FieldLabel>
            {coverPreviewUrl ? (
              <div className={styles.preview}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL or public bucket preview */}
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
                  id={`${idPrefix}-cover`}
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
    </>
  );
}
