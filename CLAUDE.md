# Luno Travel

Next.js App Router app with cookie-based Supabase auth (`@supabase/ssr`), Tailwind, and shadcn/ui (Radix). Stack: React 19, Next.js, TypeScript.

Session refresh happens in [`proxy.ts`](proxy.ts) via [`lib/supabase/proxy.ts`](lib/supabase/proxy.ts). Server and browser clients live in [`lib/supabase/`](lib/supabase/).

Required env (see [`.env.example`](.env.example)):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Coding patterns (folder structure, typing, comments, Tailwind in `.styles.ts`) live in [CONVENTIONS.md](CONVENTIONS.md). Follow that document before adding new code.

## Scripts

```bash
npm run dev    # Next.js dev server (localhost:3000)
npm run build  # production build
npm start      # serve production build
npm run lint   # ESLint
npm test       # Jest
```

## Key paths

- `app/` — routes: public home, `/auth/*`, `/editor` (auth-gated)
- `components/` — app UI; `components/ui/` — shadcn primitives
- `lib/supabase/` — Supabase clients and session proxy
- `lib/utils.ts` — shared helpers (including env-var checks)
- `proxy.ts` — Next.js proxy; refreshes the auth session

## Auth and clients

Do not hoist `createClient()` to a module-level singleton. Create a new client inside each function (Fluid compute).

`/editor` loads claims with `supabase.auth.getClaims()` and redirects to `/auth/login` when unauthenticated.

## Testing

Unit test all new components with business logic.  Shared components that are UI only do not require unit testing unless there is testable logic (not only visual)
