# Personal Notes

A simple personal cloud notes app. Open the Vercel URL from any laptop or phone, and create, edit, search and delete notes. Everything is stored in Neon PostgreSQL. There is no authentication: anyone who knows the URL can use it.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Tiptap · Drizzle ORM · Neon PostgreSQL · Vercel

The browser only talks to Next.js route handlers. `DATABASE_URL` is read server-side only and is never sent to the client.

## Local setup

```bash
npm install
```

Create `.env.local` (see `.env.example`):

```env
DATABASE_URL=your_neon_connection_string
```

Create the `notes` table:

```bash
npm run db:migrate
```

Start the dev server and open http://localhost:3456:

```bash
npm run dev
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a migration after editing `db/schema.ts` |
| `npm run db:migrate` | Apply migrations to Neon |

## Deploy

1. Push to GitHub and import the repo in Vercel.
2. Add `DATABASE_URL` (the Neon connection string) in Project Settings → Environment Variables. Do **not** prefix it with `NEXT_PUBLIC_`.
3. Redeploy. Run `npm run db:migrate` once against the Neon database (locally is fine).

## API

- `GET /api/notes?q=` — list (id, title, preview, timestamps); `q` searches title and text with `ILIKE`
- `POST /api/notes` — create
- `GET | PATCH | DELETE /api/notes/[id]`
