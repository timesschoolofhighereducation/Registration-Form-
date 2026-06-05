-- Migration: Create program_categories and programs tables
-- Run this SQL in your Supabase project (SQL editor or via psql).

-- Drop existing tables if they exist to avoid column name/schema conflicts
drop table if exists public.programs cascade;
drop table if exists public.program_categories cascade;

-- Create program_categories table
create table public.program_categories (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- Create programs table
create table public.programs (
  id bigint generated always as identity primary key,
  category_code text not null references public.program_categories(code) on delete cascade on update cascade,
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.program_categories enable row level security;
alter table public.programs enable row level security;

-- Policies (Allow all access for convenience and fallback on publishable key)
-- Note: Security is enforced at the Next.js API layer
create policy "Allow all access for program_categories" 
  on public.program_categories
  for all using (true) with check (true);

create policy "Allow all access for programs" 
  on public.programs
  for all using (true) with check (true);

-- Insert initial categories
insert into public.program_categories (code, name) values
  ('undergraduate', 'Business and Innovation'),
  ('postgraduate', 'Postgraduate Programmes'),
  ('diploma_certificate', 'Diploma / Certificate Programmes'),
  ('languages', 'Languages')
on conflict (code) do update set name = excluded.name;

-- Insert initial programs
insert into public.programs (category_code, code, name) values
  ('undergraduate', 'ACBM', 'Advanced certificate in Business Management'),
  ('undergraduate', 'ACSDM', 'Advanced certificate in Sales and Digital Marketing'),
  ('undergraduate', 'ACHR', 'Advanced certificate in Human Resource Management'),
  ('undergraduate', 'DBM', 'Diploma in Business Management'),
  ('undergraduate', 'DSM', 'Diploma in Sales and Marketing'),
  ('undergraduate', 'DHR', 'Diploma in Human Resource Management'),
  ('undergraduate', 'HDBM', 'Higher Diploma in Business Nanagement'),
  ('undergraduate', 'BBA', 'BBA'),
  ('undergraduate', 'BTL', 'BTL'),
  ('undergraduate', 'BSCM', 'BSCM'),
  ('undergraduate', 'BIT', 'BIT'),
  ('postgraduate', 'MBA', 'Master of Business Administration'),
  ('diploma_certificate', 'Diploma_Professional_English_Digital_Skills', 'Diploma in Professional English and Digital Skills'),
  ('diploma_certificate', 'AdvCert_Professional_Communication_Digital_Skills_School_Leaders', 'Advanced Certificate in Professional Communication and Digital Skills for School Leaders'),
  ('languages', 'Cambridge_Linguaskill', 'Cambridge Linguaskill')
on conflict (code) do update set category_code = excluded.category_code, name = excluded.name;
