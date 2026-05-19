# Student Registration

Next.js app for collecting student registrations and saving them into Supabase.

## Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run the SQL in `supabase_migration_create_student_registrations.sql`.
3. Create `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` for admin reads)
   - `ADMIN_PASSWORD` (required for the admin panel)

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

## Admin panel

Open [http://localhost:3000/admin](http://localhost:3000/admin). Unauthenticated visits are redirected to `/admin/login`. Sign in with `ADMIN_PASSWORD`.

Middleware protects `/admin` routes and `/api/admin/*` endpoints (except login, logout, and session).

The admin panel lets you:

- Browse all registrations (paginated)
- Search by name, NIC, email, mobile, or programme
- View full details including profile photo and bank receipt
- Export the current page to CSV

Admin API routes (`/api/admin/*`) are protected with an httpOnly session cookie set after login.
