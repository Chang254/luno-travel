# Conventions

This document contains the patterns and practices that should be followed when contributing code

## Table of Contents

- [General](#general)
  - [Typing](#typing)
- [Frontend](#frontend)
  - [Folder Structure](#folder-structure)
  - [Shared UI components](#shared-ui-components)
  - [Styles](#styles)
  - [Frontend API proxy](#frontend-api-proxy)
  - [Testing](#testing)
- [Backend](#backend)
  - [API layer (tRPC)](#api-layer-trpc)
  - [Database migrations](#database-migrations)
  - [Database types](#database-types)

## General

### Typing

#### Where to store types

Types that are tied to a specific function should live next to that function (e.g React Component props or function parameters).

```
interface MyComponentProps {
  /** Description of prop1 */
  prop1: string
}

export default function MyComponent({ prop1 }: MyComponentProps){
  ...
}
```

Shared types used across multiple functions should be placed in the appropriate /types/*.types.ts file

#### Type Inference

Let TypeScript infer types when appropriate (depend on linting for non-obvious cases).

e.g

```
const myNumber = 2
```

Does not need to be typed as a number

#### Comments

Omit Obvious Comments: Use comments to provide context that is not available by the code itself.

Leverage TSDoc for Context: When logic requires explanation, document it using TSDoc (/** ... */) instead of standard inline comments when possible. This ensures the context is surfaced directly via editor IntelliSense during asset consumption.

## Frontend

### Folder Structure

Each component should follow the following structure

```
-📁 MyComponent
  -📄 index.tsx // Contains default export
  -📄 MyComponent.styles.ts // Contains tailwind strings
  -📄 MyComponent.helpers.tsx // Utils and custom hooks consumed by MyComponent
  -📄 MyComponent.tsx // React Component
```
The goal of this structure is for the React component to be deterministic by extracting all complex calculations into pure utility functions and wrapping state changes inside custom hooks. This ensures your component file contains minimal procedural logic, resulting in predictable and human readable UI outcome

`.styles.ts`, `.helpers.tsx`, and `.actions.ts` are added only as needed — a component with no server actions has no `.actions.ts` file, and so on. `index.tsx` and `MyComponent.tsx` are the only files every component requires.

`index.tsx` should always re-export the component's default export as a default export, not a named one:

```
// index.tsx
export { default } from "./MyComponent";
```

Consumers should always import from the folder (the barrel), never by reaching into the file directly:

```
// Good
import MyComponent from "@/components/MyComponent";

// Avoid
import MyComponent from "@/components/MyComponent/MyComponent";
```

If `MyComponent.actions.ts` creates a Supabase client, follow the same rule as everywhere else: create it inside each action function rather than hoisting it to module scope (see CLAUDE.md, Auth and clients).

If a component is a child of another component, it should be nested inside of its parent's folder

```
-📁 MyComponent
  -📁 MyChildComponent
```

If a component is a shared child of two components, it should live next to both of its parents

```
-📁 Parent 1
-📁 Parent 2
-📁 Child
```

Shared utils, components, and actions should live at the appropriate root level folder (e.g /components)

### Shared UI components

Before building a new shared or primitive component (spinner, dialog, select, tabs, etc.), check [shadcn/ui](https://ui.shadcn.com/docs/components) for an equivalent and add it with the CLI:

```
npx shadcn@latest add <component>   // writes to components/ui/<component>.tsx
```

- Compose app components from the primitives in `components/ui/` rather than re-implementing them.
- Treat `components/ui/*` as generated code: don't restyle or change behavior there beyond theming — wrap the primitive in an app component instead.
- Review what the CLI changed before committing (generated imports and any dependencies it adds to `package.json`).
- Only hand-roll a primitive when shadcn/ui has no equivalent.

### Styles

Tailwind CSS Styling Conventions

We use Tailwind CSS to style components. All Tailwind class strings must be defined in the appropriate .styles.ts file, rather than written directly in the component's JSX.

```
// Button.styles.ts
export const styles = {
  button: 'bg-red-500 mt-5',
};

// Button.tsx
import { styles } from './Button.styles';

<Button className={styles.button} />
```

Avoid writing raw Tailwind class strings directly in className props. Keep styling definitions separate from component markup to maintain consistency and make styles easier to locate and maintain.

### Testing

Write unit tests for components or functions that contain business logic.  Purely presentational components do not need unit tests.

Tests should mimic real user behavior as closely as possible

• Prefer userEvent over fireEvent: ensures that complete interaction paths (like clicking, typing, or tabbing) fully dispatch all underlying side effects exactly like a human user would experience them.

• Prioritize Visible Element Selectors: Avoid querying internal component states, test IDs, or strict CSS classes unless absolutely necessary. Instead, query elements based on visible text, labels, accessible roles, or placeholders.

### Frontend API proxy

Each backend router gets a matching folder under `lib/api/<feature>/` (e.g. `server/trpc/routers/trips.ts` ↔ `lib/api/trips/`) exposing a thin React Query hook (e.g. `useTrips()`), barrel-exported via `index.ts`. Each hook lives in its own folder (`lib/api/trips/useTrips/useTrips.ts` + `index.ts` re-exporting the named hook), and the feature-level `index.ts` re-exports from those folders. Components call `useTrips()` from `@/lib/api/trips`, never the raw `trpc` client directly.

## Backend

### API layer (tRPC)

The API is built with tRPC so it can eventually be called from multiple frontends, not just this Next.js app. It lives in `server/` (sibling to `app/`, `components/`, `lib/`) and is split into four layers, each with one responsibility:

```
server/
  trpc/
    trpc.ts            // initTRPC, exports router, publicProcedure, protectedProcedure
    context.ts          // per-request context: { supabase, user }
    routers/
      _app.ts            // appRouter — combines all feature routers
      <feature>.ts         // e.g. trips.ts
  services/
    <feature>.service.ts   // business logic, calls the resource layer
  resources/
    <feature>.resource.ts  // the ONLY layer allowed to call the Supabase client
  models/
    <feature>.types.ts       // shared domain types (and zod schemas once a procedure takes input)
```

- **Routers** are thin: parse input, call a service, return its result. No business logic, no direct Supabase calls.
- **Services** hold business logic and orchestration. This is the unit-test boundary — test services the way you'd test any other function with business logic, mocking the resource layer.
- **Resources** are pure data access and the only place `supabase.from(...)` is called.
- **Models** hold domain types shared across the other three layers (e.g. a `Trip` type derived from the generated `Database` type).
- Use `protectedProcedure` (defined in `trpc.ts`) for anything that requires an authenticated user — it throws `TRPCError({ code: "UNAUTHORIZED" })` when there's no session, mirroring the existing `getClaims()` check used by `/editor` and the proxy.
- The tRPC HTTP handler lives at `app/api/trpc/[trpc]/route.ts`.

### Database migrations

All schema changes (tables, columns, RLS policies, storage policies) go through migrations in `supabase/migrations/` — never edit the schema in the Supabase dashboard. Dashboard edits aren't tracked, so local and remote drift apart and `db pull` / `db push` break.

Use the project's CLI via `npx supabase` (pinned in `package.json`), not a globally installed `supabase`. The project is linked to the remote with `npx supabase link --project-ref qomqjixapqhekwjiuplp`.

```
npx supabase migration new <name>   // creates supabase/migrations/<timestamp>_<name>.sql
npx supabase db push --dry-run      // preview what will run against the remote
npx supabase db push                // apply pending migrations to the remote
npm run db:types                    // regenerate types (see below)
```

If a change was made in the dashboard anyway, capture it with `npx supabase db pull` (requires Docker running) rather than hand-writing a migration for it. If you hand-wrote a migration for SQL that was already run on the remote, mark it applied with `npx supabase migration repair --status applied <timestamp>` so it doesn't run twice.

### Database types

`npm run db:types` regenerates `lib/supabase/database.types.ts` from the live Supabase schema. Run it after any migration.
