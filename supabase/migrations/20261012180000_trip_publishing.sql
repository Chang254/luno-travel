-- Published snapshots live in their own table: RLS is row-level, so a public
-- row on `trips` would also expose the private draft `content`.
create table public.published_trips (
  trip_id uuid primary key references public.trips(id) on delete cascade,
  owner_id uuid not null references auth.users(id),
  title text not null,
  content jsonb not null,
  cover_image_url text,
  published_at timestamptz not null default now()
);

alter table public.published_trips enable row level security;

create policy "Anyone can read published trips"
on public.published_trips
for select
to anon, authenticated
using (true);

create policy "Owners can publish their trips"
on public.published_trips
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Owners can update their published trips"
on public.published_trips
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners can unpublish their trips"
on public.published_trips
for delete
to authenticated
using (auth.uid() = owner_id);

-- Drafts are owner-only; previously every trip was readable by anyone.
drop policy if exists "Enable read access for all users" on public.trips;

create policy "Users can read their own trips"
on public.trips
for select
to authenticated
using (auth.uid() = owner_id);
