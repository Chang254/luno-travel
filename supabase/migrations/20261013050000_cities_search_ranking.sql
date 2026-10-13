-- With small towns loaded (cities1000), ranking exact names strictly first let
-- villages beat big cities ("kyo" found Kyo, Comoros before Kyoto), and short
-- queries scanned the whole table. Matches now score by log population, plus
-- a bonus for an exact name and a penalty for matching only a later word.
-- SP-GiST indexes serve prefix (`^@`) lookups of any length; word-prefix
-- matches use the trigram indexes and start at 3 letters.

create index cities_search_name_prefix on public.cities using spgist (search_name);
create index cities_search_ascii_prefix on public.cities using spgist (search_ascii);

create or replace function public.search_cities(query text, qualifier text default null, max_results int default 8)
returns setof public.cities
language sql
stable
set search_path = ''
as $$
  with q as (
    select
      public.normalize_city_text(query) as name,
      nullif(public.normalize_city_text(qualifier), '') as qualifier
  ),
  matches as (
    select c.id from public.cities c, q where c.search_name ^@ q.name
    union
    select c.id from public.cities c, q where c.search_ascii ^@ q.name
    union
    select c.id from public.cities c, q
    where length(q.name) >= 3 and c.search_name like '% ' || q.name || '%'
    union
    select c.id from public.cities c, q
    where length(q.name) >= 3 and c.search_ascii like '% ' || q.name || '%'
  )
  select c.*
  from matches m
  join public.cities c using (id)
  cross join q
  where q.name <> ''
    and (
      q.qualifier is null
      or lower(c.country_code) = q.qualifier
      or public.normalize_city_text(c.region_name) like q.qualifier || '%'
      or public.normalize_city_text(c.country_name) like q.qualifier || '%'
    )
  order by
    ln(c.population + 1)
      + case when q.name in (c.search_name, c.search_ascii) then 3 else 0 end
      - case when c.search_name ^@ q.name or c.search_ascii ^@ q.name then 0 else 3 end
      desc,
    c.population desc
  limit least(greatest(max_results, 1), 20)
$$;
