-- ============================================================
--  Santa Aurelia — database schema (Supabase)
--  Run in Supabase -> SQL Editor -> New query -> Run.
-- ============================================================

-- All editable site content lives in ONE row (id = 'content')
-- as a JSON blob: { hero:[...], gallery:[...], teachers:[...],
-- logos:{...}, aboutHeroPhoto:"..." }.
create table if not exists public.site (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- Anyone may READ the content; only signed-in admins may WRITE.
alter table public.site enable row level security;

drop policy if exists site_read on public.site;
create policy site_read on public.site
  for select using (true);

drop policy if exists site_write on public.site;
create policy site_write on public.site
  for all to authenticated using (true) with check (true);

-- ---------- Storage bucket for uploaded images ----------
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "site-media public read" on storage.objects;
create policy "site-media public read" on storage.objects
  for select using (bucket_id = 'site-media');

drop policy if exists "site-media auth write" on storage.objects;
create policy "site-media auth write" on storage.objects
  for all to authenticated
  using (bucket_id = 'site-media')
  with check (bucket_id = 'site-media');

-- No seed needed: the admin creates the content row automatically
-- on first Save (starting from the site's built-in defaults).
