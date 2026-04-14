# PO Maker Control System

A React + Vite starter for a garment factory purchase order control system.

## What is included

- Notion-like SaaS UI
- Geist font across the app
- Pages for Dashboard, Purchase Orders, Approval Queue, Suppliers, Active Jobs, Library, and Settings
- Draft PO control rule where supplier stays masked until Director approval
- Supabase client scaffold
- Supabase SQL schema starter
- Vercel-ready structure

## Main business rule

- Merchandisers and Account Managers create draft POs only.
- Draft POs do not generate official PO numbers.
- Supplier is masked as `*******` in the draft UI.
- Only the Director can reveal or change supplier, approve, issue, lock, and print the PO.

## Getting started

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env` file based on `.env.example`.

```bash
cp .env.example .env
```

Then add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Add the same environment variables in Vercel.
4. Deploy.

## Connect to Supabase

1. Create a Supabase project.
2. Open SQL editor.
3. Run the SQL from `supabase/schema.sql`.
4. Add your environment variables.
5. Replace mock data with Supabase queries as the next step.

## Suggested next build step

- Add Supabase Auth with role-based access
- Replace mock arrays with live queries
- Build create/edit draft PO form
- Add Director approval actions
- Add PDF print template and QR verification
