# Uniguard Hire

Security recruitment & vetting platform. Admin-managed job listings with a candidate apply flow, Google/email OAuth sign-in, and a Supabase-backed backend with realtime sync.

## Stack

- React + TypeScript + Vite
- Supabase (auth, database, storage, realtime)
- Deployed on Vercel

## Features

- Job listings synced to Supabase with realtime updates
- Admin panel: create, edit and delete jobs
- Candidate dashboard with multi-step apply flow and evidence upload
- Email confirmation, forgot/reset password and Google OAuth
- Security audit documented in [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)

## Development

```bash
npm install
npm run dev
```

Set the following env vars (see `.env`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Build

```bash
npm run build
```
