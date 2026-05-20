# IBA Summer Course Groups

A directory website for Sukkur IBA University students to find and join WhatsApp groups for summer courses. Students coordinate to meet the 5% class threshold required to run a summer course.

## Tech Stack

- **Next.js 14** (App Router, server + client components)
- **Tailwind CSS** (dark navy theme, glassmorphism)
- **Supabase** (PostgreSQL + Supabase JS client)
- **Google Fonts** — Plus Jakarta Sans + Inter
- **lucide-react** for icons

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd iba-summer-groups
npm install
```

### 2. Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_PASSWORD=your_secure_admin_password
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your project dashboard
3. Paste and run the contents of `schema.sql`
   - This creates all 4 tables: `programs`, `courses`, `groups`, `join_logs`
   - Seeds all 7 programs with all courses (200+ courses total)
   - Configures RLS policies

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel and add the environment variables in the Vercel dashboard.

## Features

- **Homepage** — Hero search across all programs, program cards, stats, how-it-works
- **Program pages** — Semester filter tabs, course cards with group counts
- **Course detail** — All groups for a course, join button (logs to DB then opens link), add group
- **Real-time search** — Debounced search across all program courses
- **Add Group modal** — 2-step: pick course → fill group details + invite link validation
- **Admin dashboard** — Password-protected, join logs table, groups management, CSV export

## Project Structure

```
app/
  page.tsx                    ← Home page (server component)
  admin/                      ← Admin dashboard
  course/[id]/                ← Course detail page
  program/[programCode]/      ← Program browse page
  api/
    search/                   ← GET /api/search?q=...
    groups/                   ← POST /api/groups
    join/                     ← POST /api/join
    admin/
      auth/                   ← POST /api/admin/auth
      joins/                  ← GET /api/admin/joins
      groups/                 ← DELETE /api/admin/groups?id=...
      groups-list/            ← GET /api/admin/groups-list
      stats/                  ← GET /api/admin/stats
components/
  Navbar.tsx
  ToastProvider.tsx
  HeroSearch.tsx
  ProgramCards.tsx
  StatsSection.tsx
  HowItWorks.tsx
  AddGroupModal.tsx
lib/
  supabase.ts                 ← Supabase client + type definitions
schema.sql                    ← Full database schema + seed data
```

## Admin Access

Go to `/admin` — enter the `ADMIN_PASSWORD` from your `.env.local`. Session is stored in `sessionStorage`.

Features:
- Stats: total groups, joins, joins today/this week, most joined group
- Join logs table with CSV export
- Groups table with delete capability
