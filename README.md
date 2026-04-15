# ChronoClass

ChronoClass is an intelligent college timetable management system built with Next.js 14, Supabase, Tailwind CSS, shadcn-style UI primitives, OCR-assisted import, realtime notifications, analytics, and offline support.

## Features

- Role-based access for admin, faculty, and student
- OCR timetable parsing with Tesseract.js
- Weekly timetable grid with free-slot highlighting
- Realtime notifications and unread badge updates
- Analytics dashboard with charts and audit history
- iCal export for Google Calendar import
- PWA-friendly offline banner and caching-ready configuration

## Architecture

```text
          +-------------------+
          |  Next.js 14 App   |
          |  Router + TS      |
          +---------+---------+
                    |
                    v
          +-------------------+
          |  Supabase Auth    |
          |  PostgreSQL DB    |
          |  Storage + RT     |
          +---------+---------+
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
     OCR import   Analytics    Email/Edge
    Tesseract.js   Recharts     Resend
```

## Setup

1. Copy `.env.example` to `.env.local` and fill in the Supabase, Resend, and service role values.
2. Install dependencies with `npm install`.
3. Apply the Supabase migration in `supabase/migrations/20260406_initial_schema.sql`.
4. Deploy the Supabase Edge Function in `supabase/functions/timetable-updated/index.ts`.
5. Run `npm run dev`.

## Notes

- Route protection is handled in `middleware.ts` and the protected route layout.
- UI pages currently use mock data so the app renders before backend data is connected.
- The Supabase schema includes RLS policies and seed data for a clean starting point.
# Timetable