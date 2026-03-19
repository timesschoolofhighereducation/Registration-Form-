-- Migration: create student_registrations table
-- Run this SQL in your Supabase project (SQL editor or via psql).

create table if not exists public.student_registrations (
  id bigint generated always as identity primary key,

  -- Programme details
  programme_category text not null,
  programme_name text not null,

  -- Personal details
  full_name text not null,
  name_with_initials text not null,
  date_of_birth date not null,
  gender text not null,
  nic text not null,
  address text not null,
  mobile_number text not null,
  email text not null,

  -- Emergency contact
  emergency_contact_name text not null,
  emergency_contact_number text not null,

  -- Education
  school_institution text not null,
  highest_education_qualification text not null,
  qualification_1 text,
  qualification_2 text,
  other_education_qualification text,

  -- Payment
  payment_method text not null,
  amount_paid numeric(12, 2),
  receipt_number text,
  bank_branch text,

  -- Applicant confirmation
  applicant_signed boolean not null default false,
  applicant_signed_at timestamptz,

  -- Meta
  ip_hash text,
  -- Base64 data URLs (e.g. data:image/jpeg;base64,...); store profile and receipt images
  profile_image_base64 text,
  bank_receipt_base64 text,

  created_at timestamptz not null default now()
);

-- Helpful index for searching by NIC
create index if not exists idx_student_registrations_nic
  on public.student_registrations (nic);

-- Helpful index for searching by programme and created_at
create index if not exists idx_student_registrations_programme_created_at
  on public.student_registrations (programme_name, created_at desc);

