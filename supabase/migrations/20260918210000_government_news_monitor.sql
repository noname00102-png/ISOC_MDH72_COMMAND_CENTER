-- ISOC-MDH72 Government News Monitor
create extension if not exists pgcrypto;
create table if not exists public.government_news_sources (
  id uuid primary key default gen_random_uuid(), source_name text not null, agency_name text not null,
  province text not null default 'มุกดาหาร', amphoe text, tambon text,
  source_level text not null check (source_level in ('PROVINCE','AMPHOE','TAMBON')),
  source_type text not null check (source_type in ('GOV_WEBSITE','FACEBOOK','RSS','API','OTHER')),
  website_url text, facebook_url text, rss_url text, api_url text,
  verification_status text not null default 'UNVERIFIED' check (verification_status in ('VERIFIED','UNVERIFIED','BROKEN','REDIRECT','NO_CHANNEL','DUPLICATE','REQUIRES_REVIEW')),
  verification_source text, verified_at timestamptz, priority text not null default 'B' check (priority in ('A','B','C')),
  is_active boolean not null default true, last_checked_at timestamptz, last_success_at timestamptz, last_error text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(source_name, source_type, website_url, facebook_url, rss_url, api_url)
);
create table if not exists public.government_news_items (
  id uuid primary key default gen_random_uuid(), source_id uuid references public.government_news_sources(id) on delete set null,
  source_name text, source_level text, title text not null, summary text, content_text text,
  original_url text not null unique, published_at timestamptz, collected_at timestamptz not null default now(),
  province text default 'มุกดาหาร', amphoe text, tambon text, village text, category text, threat_category text,
  ai_relevance numeric(5,2), ai_confidence numeric(5,2),
  verification_status text not null default 'NEW' check (verification_status in ('NEW','AI_SCREENED','WAITING_VERIFICATION','VERIFIED','REJECTED')),
  is_duplicate boolean not null default false, duplicate_of uuid references public.government_news_items(id) on delete set null,
  event_cluster text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_gns_level_active on public.government_news_sources(source_level,is_active);
create index if not exists idx_gni_published on public.government_news_items(published_at desc);
create index if not exists idx_gni_area on public.government_news_items(amphoe,tambon);
create index if not exists idx_gni_status on public.government_news_items(verification_status);
create index if not exists idx_gni_source_id on public.government_news_items(source_id);
create index if not exists idx_gni_duplicate_of on public.government_news_items(duplicate_of);
alter table public.government_news_sources enable row level security;
alter table public.government_news_items enable row level security;
drop policy if exists "government_news_sources_read" on public.government_news_sources;
create policy "government_news_sources_read" on public.government_news_sources for select to anon, authenticated using (true);
drop policy if exists "government_news_items_read" on public.government_news_items;
create policy "government_news_items_read" on public.government_news_items for select to anon, authenticated using (true);
drop policy if exists "government_news_sources_write" on public.government_news_sources;
drop policy if exists "government_news_items_write" on public.government_news_items;
create policy "government_news_sources_insert" on public.government_news_sources for insert to authenticated with check (true);
create policy "government_news_sources_update" on public.government_news_sources for update to authenticated using (true) with check (true);
create policy "government_news_sources_delete" on public.government_news_sources for delete to authenticated using (true);
create policy "government_news_items_insert" on public.government_news_items for insert to authenticated with check (true);
create policy "government_news_items_update" on public.government_news_items for update to authenticated using (true) with check (true);
create policy "government_news_items_delete" on public.government_news_items for delete to authenticated using (true);