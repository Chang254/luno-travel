"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { ACCEPTED_COVER_TYPES, useNewTripForm } from "./NewTripForm.helpers";
import { styles } from "./NewTripForm.styles";

export default function NewTripForm() {
  const form = useNewTripForm();
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>New trip</CardTitle>
        <CardDescription>Give your trip a name and, if you like, a cover photo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className={styles.form} onSubmit={form.submit}>
          <div className={styles.field}>
            <Label htmlFor="trip-title">Title</Label>
            <Input
              id="trip-title"
              value={form.title}
              onChange={(event) => form.setTitle(event.target.value)}
              placeholder="Summer in Kyoto"
              maxLength={200}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="trip-cover">Cover photo (optional)</Label>
            {form.coverPreviewUrl ? (
              <div className={styles.preview}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                <img src={form.coverPreviewUrl} alt="Cover preview" className={styles.previewImage} />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className={styles.removeButton}
                  onClick={form.removeCover}
                  aria-label="Remove cover photo"
                >
                  <X />
                </Button>
              </div>
            ) : (
              <>
                <input
                  key={form.coverInputKey}
                  ref={coverInputRef}
                  id="trip-cover"
                  type="file"
                  accept={ACCEPTED_COVER_TYPES}
                  className={styles.hiddenFileInput}
                  tabIndex={-1}
                  onChange={(event) => form.selectCover(event.target.files?.[0])}
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
            {form.coverError && <p className={styles.error}>{form.coverError}</p>}
          </div>

          {form.isError && (
            <p role="alert" className={styles.error}>
              Couldn&apos;t create the trip. Please try again.
            </p>
          )}

          <Button type="submit" className={styles.submitButton} disabled={!form.canSubmit}>
            {form.isPending && <Spinner />}
            {form.isPending ? "Creating…" : "Create trip"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
