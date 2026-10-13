"use client";

import { useMemo } from "react";
import { defineExtension } from "lexical";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

import {
  contentExtensionDependencies,
  editorConfig,
  getInitialEditorState,
} from "@/lib/lexical/tripContent";
import { tripContentStyles } from "@/lib/lexical/tripContent.styles";
import CountryFlag from "@/components/CountryFlag";
import { getTripImageUrl } from "@/lib/supabase/storage";
import type { Trip } from "@/server/models/trips.types";

import { styles } from "./TripReader.styles";

interface TripReaderProps {
  title: string;
  /** Object path in the trip images bucket. */
  coverImagePath?: string | null;
  content: Trip["content"];
  cityName?: string | null;
  /** ISO-2 code; shown as a flag beside the city. */
  cityCountryCode?: string | null;
}

/** Read-only render of trip content with the editor's own nodes and theme, so it matches the editor. */
export default function TripReader({
  title,
  coverImagePath,
  content,
  cityName,
  cityCountryCode,
}: TripReaderProps) {
  const readerExtension = useMemo(
    () =>
      defineExtension({
        name: "LunoReader/root",
        ...editorConfig,
        editable: false,
        $initialEditorState: getInitialEditorState(content),
        dependencies: contentExtensionDependencies,
      }),
    [content],
  );

  return (
    <article className={styles.article}>
      {coverImagePath && (
        // eslint-disable-next-line @next/next/no-img-element -- matches the editor's images, served from the public bucket
        <img
          src={getTripImageUrl(coverImagePath)}
          alt={`Cover photo for ${title}`}
          className={styles.cover}
        />
      )}
      <h1 className={styles.title}>{title}</h1>
      {cityName && (
        <p className={styles.city}>
          {cityCountryCode && <CountryFlag countryCode={cityCountryCode} />}
          {cityName}
        </p>
      )}
      <LexicalExtensionComposer
        extension={readerExtension}
        contentEditable={<ContentEditable className={tripContentStyles.surface} />}
      />
    </article>
  );
}
