-- Cities now come from the bundled GeoNames list instead of Google Places.
-- The picked city's id is only used to look it up server-side, so it isn't
-- stored. Coordinates are kept for maps; trips whose city was picked through
-- Google keep their name and country but have none.
alter table public.trips
  drop column city_place_id,
  add column city_latitude double precision,
  add column city_longitude double precision;

alter table public.published_trips
  drop column city_place_id,
  add column city_latitude double precision,
  add column city_longitude double precision;
