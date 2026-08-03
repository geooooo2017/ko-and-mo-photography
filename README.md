# Ko&Mo Photography

Wedding, newborn, and family photography website for Ko&Mo Photography (Barrhead, Glasgow).

## Stack

- Vite + React + TypeScript + Tailwind CSS
- Supabase (availability calendar + enquiries + photographer admin)
- Vercel hosting

## Local development

```bash
npm install
cp .env.example .env.local
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Photographer admin

Open `/admin` and sign in with the photographer Supabase Auth user to:

- set dates as available / limited / booked
- review and update booking enquiries

## Deploy

Connected to GitHub + Vercel. Set these environment variables in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
