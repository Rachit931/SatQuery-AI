-- ==============================================================================
-- SatQuery-AI: Analysis History Schema & Row Level Security (RLS)
-- Table: analysis_history
-- ==============================================================================

-- 1. Create analysis_history table if it does not already exist
create table if not exists public.analysis_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    query text not null,
    analysis_type text,
    answer text,
    model_used text,
    confidence numeric,
    result_data jsonb default '{}'::jsonb,
    zone_id uuid,
    created_at timestamptz not null default now()
);

-- 2. Add optional columns if table already existed with previous schema
do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analysis_history' and column_name = 'model_used') then
        alter table public.analysis_history add column model_used text;
    end if;

    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'analysis_history' and column_name = 'zone_id') then
        alter table public.analysis_history add column zone_id uuid;
    end if;
end $$;

-- 3. Enable Row Level Security (RLS)
alter table public.analysis_history enable row level security;

-- 4. RLS Policies
-- Policy: Authenticated users can SELECT only their own history
drop policy if exists "Users can read own analysis history" on public.analysis_history;
create policy "Users can read own analysis history"
    on public.analysis_history
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy: Authenticated users can INSERT only rows where user_id = auth.uid()
drop policy if exists "Users can insert own analysis history" on public.analysis_history;
create policy "Users can insert own analysis history"
    on public.analysis_history
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy: Authenticated users can DELETE only their own history
drop policy if exists "Users can delete own analysis history" on public.analysis_history;
create policy "Users can delete own analysis history"
    on public.analysis_history
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- 5. Helpful indexes for fast querying by user and descending date
create index if not exists idx_analysis_history_user_created 
    on public.analysis_history (user_id, created_at desc);

create index if not exists idx_analysis_history_zone_id 
    on public.analysis_history (zone_id);
