-- Trips point at a `cities` row instead of copying its details. Existing
-- cities (picked through Google, then GeoNames) are matched by country and
-- normalized name, largest city first; trips with no match are deleted.
alter table public.trips
  add column city_id bigint references public.cities(id) on delete restrict;

update public.trips t
set city_id = (
  select c.id
  from public.cities c
  where c.country_code = t.city_country_code
    and public.normalize_city_text(t.city_name) in (c.search_name, c.search_ascii)
  order by c.population desc
  limit 1
);

-- Cascades to their published snapshots.
delete from public.trips where city_id is null;

alter table public.trips
  alter column city_id set not null,
  drop column city_name,
  drop column city_country_code,
  drop column city_latitude,
  drop column city_longitude;

create index trips_city_id_idx on public.trips (city_id);

-- Snapshots match from their own copy, which can differ from the draft's.
alter table public.published_trips
  add column city_id bigint references public.cities(id) on delete restrict;

update public.published_trips p
set city_id = (
  select c.id
  from public.cities c
  where c.country_code = p.city_country_code
    and public.normalize_city_text(p.city_name) in (c.search_name, c.search_ascii)
  order by c.population desc
  limit 1
);

alter table public.published_trips
  drop column city_name,
  drop column city_country_code,
  drop column city_latitude,
  drop column city_longitude;

create index published_trips_city_id_idx on public.published_trips (city_id);
