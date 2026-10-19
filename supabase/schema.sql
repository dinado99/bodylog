-- Supabase SQL Editor에 붙여넣어 실행하세요.

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date date not null,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  body_fat_pct numeric(4,1),
  memo text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date date not null,
  meal_type text not null check (meal_type in ('아침','점심','저녁','간식')),
  menu text not null,
  kcal integer check (kcal >= 0),
  created_at timestamptz not null default now()
);

create index if not exists meal_logs_user_date on public.meal_logs (user_id, log_date);

-- 본인 데이터만 읽고 쓸 수 있도록 RLS 적용 (공개 레포이므로 필수)
alter table public.weight_logs enable row level security;
alter table public.meal_logs enable row level security;

create policy "weight_logs_own" on public.weight_logs
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "meal_logs_own" on public.meal_logs
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
