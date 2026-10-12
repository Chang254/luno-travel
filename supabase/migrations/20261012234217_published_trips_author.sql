-- Snapshot the author's display name and avatar at publish time: auth.users
-- isn't readable by anonymous visitors, but the public page and its OG image
-- need to show who wrote the trip.
alter table public.published_trips
  add column author_name text,
  add column author_avatar_url text;
