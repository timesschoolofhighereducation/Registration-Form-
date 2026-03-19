# Student Registration

Next.js app for collecting student registrations and saving them into Supabase.

## Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run the SQL in `supabase_migration_create_student_registrations.sql`.
3. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Example:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your real values from Supabase.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), fill the form, preview, and submit.

## How saving works

- Frontend submits form data to `POST /api/register`
- Server route validates with `zod`
- Valid payload is inserted into `public.student_registrations` in Supabase

If env variables are missing, the API now returns a clear error instead of failing silently.
