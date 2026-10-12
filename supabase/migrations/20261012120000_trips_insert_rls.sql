-- Only allow a user to create trips they own. The previous policy accepted
-- any owner_id, letting one user insert trips into another's account.
drop policy if exists "Enable insert for authenticated users only" on public.trips;

create policy "Users can create their own trips"
on public.trips
for insert
to authenticated
with check (auth.uid() = owner_id);
