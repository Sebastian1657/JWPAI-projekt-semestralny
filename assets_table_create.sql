create table assets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  price numeric default 0,
  file_url text not null,
  file_type text not null,
  user_id uuid references auth.users not null
);

alter table assets enable row level security;

create policy "Public assets are viewable by everyone"
  on assets for select
  using ( true );

create policy "Users can insert their own assets"
  on assets for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own assets"
  on assets for update
  using ( auth.uid() = user_id );

create policy "Users can delete own assets"
  on assets for delete
  using ( auth.uid() = user_id );