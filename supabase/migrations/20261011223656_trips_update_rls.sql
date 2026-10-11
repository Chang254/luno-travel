-- Allow a user to update only the trips they own.
alter table public.trips enable row level security;

create policy "Users can update their own trips"
on public.trips
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);
