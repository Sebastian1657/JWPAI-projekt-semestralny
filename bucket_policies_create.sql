drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Users can update own files" on storage.objects;
drop policy if exists "Users can delete own files" on storage.objects;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'assets_bucket' );

create policy "Authenticated users can upload to own folder"
on storage.objects for insert
with check (
  bucket_id = 'assets_bucket' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own files"
on storage.objects for update
using (
  bucket_id = 'assets_bucket' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own files"
on storage.objects for delete
using (
  bucket_id = 'assets_bucket' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);