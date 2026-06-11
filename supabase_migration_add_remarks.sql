-- Migration: Add remarks column to student_registrations table
-- Run this SQL in your Supabase project (SQL editor or via psql).

alter table public.student_registrations
add column if not exists remarks text;
