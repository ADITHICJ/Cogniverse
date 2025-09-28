-- 🚨 Drop old table if it exists
drop table if exists public.draft_versions cascade;

-- ✅ Create new draft_versions table
create table public.draft_versions (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.drafts(id) on delete cascade,
  content text not null,
  version_number integer not null,
  created_at timestamp with time zone default now()
);

-- ✅ Index for faster lookups by draft_id
create index draft_versions_draft_id_idx on public.draft_versions(draft_id);

-- Enable RLS
alter table public.draft_versions enable row level security;

-- Allow SELECT if user owns the parent draft
create policy "Allow select own draft_versions"
on public.draft_versions
for select
using (
  exists (
    select 1 from public.drafts d
    where d.id = draft_versions.draft_id
    and d.user_id = auth.uid()
  )
);

-- Allow INSERT if user owns the parent draft
create policy "Allow insert own draft_versions"
on public.draft_versions
for insert
with check (
  exists (
    select 1 from public.drafts d
    where d.id = draft_versions.draft_id
    and d.user_id = auth.uid()
  )
);

-- Allow DELETE if user owns the parent draft (needed for restore functionality)
create policy "Allow delete own draft_versions"
on public.draft_versions
for delete
using (
  exists (
    select 1 from public.drafts d
    where d.id = draft_versions.draft_id
    and d.user_id = auth.uid()
  )
);