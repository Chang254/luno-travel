-- One city per trip, picked via Google Places. Only `city_place_id` may be
-- kept indefinitely under Google's terms; the name and ISO-2 country code are
-- display copies so the sidebar and public page render without calling Google.
alter table public.trips
  add column city_place_id text,
  add column city_name text,
  add column city_country_code char(2);

-- Snapshotted on publish alongside title and cover.
alter table public.published_trips
  add column city_place_id text,
  add column city_name text,
  add column city_country_code char(2);
