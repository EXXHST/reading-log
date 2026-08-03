create table if not exists public.books (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  author text default '',
  genre text default '',
  kind text not null default 'fiction',
  status text not null default 'want',
  date_finished date,
  rating int not null default 0,
  synopsis text default '',
  quotes jsonb not null default '[]'::jsonb,
  created_at bigint not null
);

alter table public.books enable row level security;

create policy "select own books" on public.books for select using (auth.uid() = user_id);
create policy "insert own books" on public.books for insert with check (auth.uid() = user_id);
create policy "update own books" on public.books for update using (auth.uid() = user_id);
create policy "delete own books" on public.books for delete using (auth.uid() = user_id);

create table if not exists public.custom_statuses (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  status_id text not null,
  label text not null,
  created_at bigint not null,
  primary key (user_id, status_id)
);

alter table public.custom_statuses enable row level security;

create policy "select own statuses" on public.custom_statuses for select using (auth.uid() = user_id);
create policy "insert own statuses" on public.custom_statuses for insert with check (auth.uid() = user_id);
create policy "delete own statuses" on public.custom_statuses for delete using (auth.uid() = user_id);
