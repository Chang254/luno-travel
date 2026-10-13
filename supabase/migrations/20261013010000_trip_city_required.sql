-- Every trip has a place; rows without one were removed beforehand.
-- published_trips keeps nullable columns since it's a snapshot.
alter table public.trips
  alter column city_place_id set not null,
  alter column city_name set not null,
  alter column city_country_code set not null;
