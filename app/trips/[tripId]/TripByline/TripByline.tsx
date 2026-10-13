import { Fragment } from "react";

import CountryFlag from "@/components/CountryFlag";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, type UserProfile } from "@/lib/auth/userProfile";
import { formatPublishedDate } from "./TripByline.helpers";
import { styles } from "./TripByline.styles";

interface TripBylineProps {
  author?: UserProfile;
  cityName?: string | null;
  /** ISO-2 code; shown as a flag beside the city. */
  cityCountryCode?: string | null;
  /** ISO timestamp; `null` for a draft that has never been published. */
  publishedAt: string | null;
}

/** Author, place and publish date on one line, separated by dots. Shared by the public page and the draft preview so they match. */
export default function TripByline({ author, cityName, cityCountryCode, publishedAt }: TripBylineProps) {
  const parts = [
    author && (
      <span key="author" className={styles.author}>
        <Avatar size="sm">
          {/* Google avatar URLs can 403 when a referrer is sent. */}
          {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt="" referrerPolicy="no-referrer" />}
          <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
        </Avatar>
        {author.name && <span className={styles.name}>{author.name}</span>}
      </span>
    ),
    cityName && (
      <span key="place" className={styles.place}>
        {cityCountryCode && <CountryFlag countryCode={cityCountryCode} />}
        {cityName}
      </span>
    ),
    publishedAt ? (
      <span key="published">
        Published <time dateTime={publishedAt}>{formatPublishedDate(publishedAt)}</time>
      </span>
    ) : (
      <span key="published">Not published yet</span>
    ),
  ].filter(Boolean);

  return (
    <div className={styles.byline}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <span aria-hidden>·</span>}
          {part}
        </Fragment>
      ))}
    </div>
  );
}
