-- Trip images live at `{user_id}/{trip_id}/{file}` in the public `Luno Images`
-- bucket. Reads go through the public URL; writes are limited to the
-- uploader's own folder. `remove()` needs select as well as delete.
create policy "Users can upload trip images to their own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'Luno Images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can read trip images in their own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'Luno Images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can delete trip images in their own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'Luno Images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
