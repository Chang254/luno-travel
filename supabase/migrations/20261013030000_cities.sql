-- GeoNames cities (CC BY 4.0), loaded by `npm run cities:load`. Trips point
-- at a row here instead of copying its name, country and coordinates.
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- Lowercase words without accents or punctuation, so "sao paulo" finds
-- "São Paulo". Accents are stripped before lowercasing because lower() only
-- folds ASCII under the C collation. Immutable so generated columns can use it.
create function public.normalize_city_text(text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select btrim(regexp_replace(
    lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce($1, ''))),
    '[^[:alnum:]]+', ' ', 'g'
  ))
$$;

create table public.cities (
  -- The GeoNames id.
  id bigint primary key,
  name text not null,
  ascii_name text not null,
  -- ISO 3166-1 alpha-2, e.g. "JP".
  country_code char(2) not null,
  country_name text not null,
  -- State, prefecture, etc.
  region_name text,
  latitude double precision not null,
  longitude double precision not null,
  population bigint not null default 0,
  search_name text generated always as (public.normalize_city_text(name)) stored,
  search_ascii text generated always as (public.normalize_city_text(ascii_name)) stored
);

create index cities_search_name_trgm on public.cities using gin (search_name extensions.gin_trgm_ops);
create index cities_search_ascii_trgm on public.cities using gin (search_ascii extensions.gin_trgm_ops);

-- Public reference data; only the loader (a direct connection) writes it.
alter table public.cities enable row level security;

create policy "Anyone can read cities"
on public.cities
for select
to anon, authenticated
using (true);

-- Autocomplete: exact names first, then name prefixes, then a later word's
-- prefix ("york" finds "New York City"); larger cities first within each.
-- Text after a comma in the UI arrives as `qualifier` and narrows by country
-- code, region or country name ("portland, maine", "paris, fr").
create function public.search_cities(query text, qualifier text default null, max_results int default 8)
returns setof public.cities
language sql
stable
set search_path = ''
as $$
  with q as (
    select
      public.normalize_city_text(query) as name,
      nullif(public.normalize_city_text(qualifier), '') as qualifier
  )
  select c.*
  from public.cities c, q
  where q.name <> ''
    and (
      c.search_name like q.name || '%'
      or c.search_ascii like q.name || '%'
      or c.search_name like '% ' || q.name || '%'
      or c.search_ascii like '% ' || q.name || '%'
    )
    and (
      q.qualifier is null
      or lower(c.country_code) = q.qualifier
      or public.normalize_city_text(c.region_name) like q.qualifier || '%'
      or public.normalize_city_text(c.country_name) like q.qualifier || '%'
    )
  order by
    case
      when q.name in (c.search_name, c.search_ascii) then 0
      when c.search_name like q.name || '%' or c.search_ascii like q.name || '%' then 1
      else 2
    end,
    c.population desc
  limit least(greatest(max_results, 1), 20)
$$;
