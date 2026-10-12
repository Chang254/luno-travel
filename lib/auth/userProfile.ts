export interface UserProfile {
  name: string | null;
  avatarUrl: string | null;
}

interface ProfileClaims {
  email?: string;
  user_metadata?: Record<string, unknown>;
}

function firstString(...values: unknown[]): string | null {
  const match = values.find((value) => typeof value === "string" && value.trim() !== "");
  return typeof match === "string" ? match.trim() : null;
}

/**
 * Display name and avatar from the Google OAuth `user_metadata` on the
 * session claims. Google sends both `full_name`/`name` and
 * `avatar_url`/`picture`; the name falls back to the email.
 */
export function getUserProfile(claims: ProfileClaims): UserProfile {
  const metadata = claims.user_metadata ?? {};

  return {
    name: firstString(metadata.full_name, metadata.name, claims.email),
    avatarUrl: firstString(metadata.avatar_url, metadata.picture),
  };
}

/** Up to two initials for an avatar fallback, e.g. "Ada Lovelace" → "AL". */
export function getInitials(name: string | null): string {
  if (!name) return "";

  const words = name.split(/\s+/).filter(Boolean);
  const initials = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return initials.map((word) => word[0].toUpperCase()).join("");
}
