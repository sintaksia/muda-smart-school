# Project Guidelines for Claude

## Project Overview

Enterprise Next.js school website with TypeScript, Tailwind CSS, Shadcn/ui, Prisma, and Supabase.

---

## Enforced Guardrails — READ FIRST

Some rules in this file are **machine-enforced**. They are not advisory.

| Rule                                                                              | Severity | Enforced by                                |
| --------------------------------------------------------------------------------- | -------- | ------------------------------------------ |
| Banned radius (`rounded-xl/2xl/3xl/4xl`, `rounded-input/card/modal`)              | error    | `ds/banned-classes`                        |
| Banned elevation (`shadow-lg/xl/2xl/2lg`, colored shadows)                        | error    | `ds/banned-classes`                        |
| Deleted Jago tokens (`bg-brand`, `text-ink`, `border-hairline`, `var(--color-*)`) | error    | `ds/banned-classes`                        |
| Native `<select>` / `<textarea>` / `<input>` instead of the shadcn primitive      | error    | `ds/native-form-elements`                  |
| Recolored `ghost`/`outline` button with no explicit `hover:bg-*`                  | error    | `ds/variant-hover`                         |
| `features/` and `components/` importing from `app/`                               | error    | `@typescript-eslint/no-restricted-imports` |
| `new PrismaClient()` outside `src/lib/prisma.ts`                                  | error    | `no-restricted-syntax`                     |
| Off-palette hues (`blue-*`, `purple-*`, …)                                        | warn     | `ds/off-palette`                           |
| Component files over 150 lines                                                    | warn     | `max-lines`                                |
| Missing `.test.ts` for new `features/` or `api/` files                            | warn     | Claude `Stop` hook                         |

Rules live in `eslint.config.mjs`. They run in three places:

0. **Before you write** — a `PreToolUse` hook (`.claude/hooks/color-contract.mjs`)
   parses `src/app/globals.css` and injects the **resolved** value of every
   semantic token into context on any `.tsx` write that touches color, flagging
   tokens that resolve into a non-brand ramp. Colors are never guessed or
   recalled from memory; the contract arrives before the edit. Lint can only
   see class names you wrote — it cannot see that `variant="ghost"` resolves to
   `hover:bg-accent` → `--accent` → `#3b82f6`, which is why this layer exists.
1. **As you write** — a `PostToolUse` hook (`.claude/hooks/guardrails.mjs`)
   lints every `.ts`/`.tsx` written under `src/`. **Errors block the edit and
   are returned to you — fix them in the same turn.** Warnings are shown only.
2. **On commit** — `lint-staged` runs `eslint --fix`.
3. **On push** — `.husky/pre-push` runs `pnpm lint:ci` then `pnpm build`.
4. **On PR** — CI runs `pnpm lint:ci`, `tsc --noEmit` and the test suite.

`pnpm lint:ci` is `eslint --max-warnings 55` — a **ratchet**. Warnings may go
down, never up: adding one new warning fails the build even though warnings are
non-blocking locally. When you clear warnings, lower the number in the
`lint:ci` script to lock the gain in. Never raise it to make a build pass.

Errors currently sit at **zero**. If one fires, you introduced it — fix the
code, don't weaken the rule. Type-only imports are exempt from the boundary
rules. For a genuine exception (see `docs/design_system.md` §2.4), add an
`eslint-disable-next-line` **with a written reason**; a bare disable is not
acceptable.

Never edit `eslint.config.mjs` to silence a rule you tripped.

---

## Design System - STRICTLY FOLLOW

**`docs/design_system.md` is the single source of truth** for color,
typography, radius and elevation. Read it before writing any UI. Do not restate
its tables here, in the README, or in component comments — link to it.

Tokens are implemented in `src/app/globals.css`.

The non-negotiables, so they're never guessed:

- **Three brand hues only** — `primary-*` (navy `#32368C`), `green-*`
  (`#4CAF93`), `yellow-*` (`#F2C94C`), each on a 50–950 scale, plus the
  semantic tokens (`--foreground`, `--border`, `--muted`, `--destructive`, …).
  Default Tailwind hues (`blue-*`, `purple-*`, `indigo-*`, …) are not part of
  the system — see §2.4 of the doc for the three narrow exceptions before you
  "fix" any of them.
- **Three radius tiers only** — `rounded-sm` (10px: inputs, chips, small
  buttons, icon tiles), `rounded-md` (16px: cards — the default),
  `rounded-lg` (20px: modals, hero media). Never exceed 20px.
  `rounded-full` is for avatars, status dots and badges/pills only — §4.3 of
  the doc lists the decided cases, so don't re-litigate them per component.
- **Form controls always come from a primitive, never hand-rolled** —
  `SelectField` / `FormSelect` (`src/components/common/`) for dropdowns,
  `ui/input`, `ui/textarea`, `ui/button`. A native `<select>`/`<textarea>`/
  `<input>` is an ESLint error; the only exempt inputs are
  `type="file|checkbox|radio|range"`. Native `<button>` stays legal for custom
  clickable surfaces (tiles, sort headers) — §6.1 of the doc draws the line, so
  don't re-litigate it per component. Size overrides come from
  `components/common/formClasses.ts`; never declare a local `inputClass`.
- **Forms open in a popup or on their own route — never inline above a table** —
  `components/common/FormDialog` + `FormDialogActions`, opened by
  `admin/_components/CreateButton` (which takes `href` _or_ `onClick`), or a
  dedicated `create/`/`[id]/` page. Only **filters** sit inline above a table,
  sharing the header row with the create button. §6.2 of the doc has the
  breakdown — don't re-litigate it per page, and don't hand-roll a
  `<Dialog><DialogContent>` shell for a form.
- **Elevation is hairline-first** — resting cards get `border border-border`
  and no shadow; hoverable cards add `hover:shadow-sm`; overlays get
  `shadow-md`. `shadow-lg`/`xl`/`2xl` and colored shadows are banned.

```jsx
className = "bg-primary-500 text-primary-50";
className = "bg-green-500 text-green-50";
className = "bg-yellow-400 text-yellow-950";
```

---

## Component Placement Rules - CRITICAL

### Rule 1: Page-Specific Components

**Location:** `app/[route]/_components/`
**When:** Component used ONLY on that specific page

### Rule 2: Feature-Shared Components

**Location:** `features/[feature]/components/`
**When:** Component used 2+ times within SAME feature

### Rule 3: Global Shared Components

**Location:** `components/`
**When:** Component used across MULTIPLE features

---

## No Duplicate Code - STRICTLY FOLLOW (DRY)

**Never write the same JSX, logic, values, or types in more than one place — including Next.js convention files (`loading.tsx`, `error.tsx`, `not-found.tsx`), API routes, and any other file.** If code is (or will be) needed in 2+ places, it MUST live in one shared, reusable place and be imported everywhere it's used.

- **Before writing any component/markup/logic/value**, search the codebase for something that already does this or is close to it. If found, reuse or extend it — don't write a parallel copy.
- **If you catch yourself writing code that looks like code you already wrote elsewhere in this session or that already exists in the repo**, stop and extract it into a shared component/util/const instead of duplicating it.
- **Components:** any JSX/markup used (or reasonably likely to be reused) in 2+ places must be extracted into a component and placed per the Component Placement Rules above (`_components/` for page-only, `features/[feature]/components/` for feature-shared, `components/` for global-shared).
- **Constants/enums/labels/config:** any literal value, options list, label map, or config used in 2+ places must live once in `src/lib/constants.ts` (or a feature-level `constants.ts`) and be imported — never re-declared or hardcoded locally. This includes the existing Enum/Status Single Source of Truth rule, but applies to ALL shared constants, not just Prisma-enum-backed ones.
- **Utils/hooks/types:** any pure function, hook, or TypeScript type/interface used in 2+ places must be extracted to `utils/`, `hooks/`, or `types/` and imported — never copy-pasted or redefined.
- **Route-convention files** (`loading.tsx`, `error.tsx`, `not-found.tsx`, etc.) must stay thin wrappers that render a shared component — never inline the same markup independently in multiple segments.

```tsx
// ✅ CORRECT - shared component, imported everywhere
// src/app/admin/_components/AdminLoadingState.tsx
export function AdminLoadingState() {
  /* markup */
}

// src/app/admin/cms/loading.tsx
import { AdminLoadingState } from "../_components/AdminLoadingState";
export default function CmsLoading() {
  return <AdminLoadingState />;
}

// ❌ WRONG - same markup/logic duplicated in a second file
export default function CmsLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <p className="text-sm text-primary-700">Memuat data...</p>
    </div>
  );
}
```

If you ever find existing duplicate code while working in a file, extract and consolidate it as part of the task rather than leaving it duplicated.

---

## Package Manager

Use **pnpm** and **pnpx** — never `npm`/`npx`. CLI tools go through `pnpx`
(e.g. `pnpx prisma generate`).

---

## Naming Conventions

- **Components:** PascalCase (`CourseCard.tsx`)
- **Utilities:** camelCase (`formatDate.ts`)
- **API routes:** kebab-case folders (`api/courses/`)
- **Page-specific:** Add context prefix (`PublicCourseCard`, `DashboardCourseCard`)

### English for Code — STRICTLY FOLLOW

All code identifiers must be English, regardless of the domain being modeled. This applies to Prisma models/fields/enum names/enum values, TypeScript types/interfaces, variables, function names, component names, file names, and API route segments (`src/app/api/**`).

- **Only user-facing, human-readable text stays Indonesian**: JSX text content, toast/error message strings, `placeholder`/`label` props, and the `label` field in `constants.ts` options arrays (e.g. `{ value: "SCOUTING", label: "Kepanduan" }`). Never translate the `value`/`key` side of these pairs.
- **Admin/dashboard page routes (`src/app/admin/**`, `src/app/guru/**`, `src/app/siswa/**`, etc.) may keep their existing Indonesian URL segments** (`/admin/guru`, `/admin/kelas`, `/admin/mapel`, `/admin/siswa`, `/admin/jadwal`, `/admin/absensi`) — these are established public-facing paths and renaming them is out of scope unless explicitly requested. `src/app/api/\*\*`route segments, by contrast, must be English (e.g.`api/master/teachers`, not `api/master/guru`).
- **Before writing a new model/field/function/component for an Indonesian-named domain concept, check for the English equivalent already established in this codebase** — e.g. `Teacher` (not `Guru`), `SchoolClass` (not `Kelas`), `Subject` (not `MataPelajaran`/`Mapel`), `Student` (not `Siswa`), `Schedule` (not `Jadwal`), `Session` (not `Sesi`), `LeaveRequest` (not `PengajuanIzin`/`Izin`), `Registration` (not `Pendaftaran`). Reuse the English name; don't introduce a parallel Indonesian-named copy.
- If you find an existing Indonesian-named identifier, file, or API route while working nearby, rename it to English as part of the change rather than leaving it half-migrated — but do not go out of your way to do a repo-wide sweep unless asked.
- **Domain-entity display nouns are single-sourced in `ENTITY_LABELS` (`src/lib/constants.ts`)** — e.g. `ENTITY_LABELS.STUDENT` ("Siswa"), `ENTITY_LABELS.TEACHER` ("Guru"), `ENTITY_LABELS.CLASS` ("Kelas"), `ENTITY_LABELS.SUBJECT` ("Mata Pelajaran"). Never hardcode these words as string literals in page titles, sidebar nav, table headers, toggle labels, export headers, or options-array `label` fields — import `ENTITY_LABELS` instead, so a wording change updates every consumer at once. Add a new key here before introducing another core entity noun.

---

## Code Standards

### TypeScript

- Use interfaces for objects
- Type function parameters and returns
- NEVER use `any` (implicit or explicit)
- Always explicitly type variables, parameters, and return types — never rely on implicit `any`
- In `.map()`, `.filter()`, `.forEach()`, etc., always ensure the callback parameter has a known type (from a typed array or explicit annotation)
- In `catch` blocks, always type as `unknown` and narrow with `instanceof Error`; omit the binding entirely if it is not used

```tsx
// ✅ CORRECT
} catch (error: unknown) {
  toast.error(error instanceof Error ? error.message : "Something went wrong");
}

// ✅ CORRECT - binding omitted when unused
} catch {
  toast.error("Something went wrong");
}

// ❌ WRONG
} catch (error: any) { ... }

// ❌ WRONG - unused binding triggers no-unused-vars
} catch (error) {
  toast.error("Something went wrong");
}
```

### Components

- Functional components with TypeScript
- Named exports (except pages)
- Use `@/` path aliases

### API Routes

- Use Route Handlers pattern
- Validate with Zod schemas

### Zod v4 - STRICTLY FOLLOW

This project uses **Zod v4**. The API has changed from v3.

#### Enum Validation

```tsx
// ✅ CORRECT - Zod v4 syntax
z.enum(["ADMIN", "USER"], {
  message: "Role wajib dipilih",
});

// ❌ WRONG - Zod v3 syntax (DO NOT USE)
z.enum(["ADMIN", "USER"], {
  required_error: "Role wajib dipilih",
});
```

#### Error Messages

```tsx
// ✅ CORRECT - Zod v4
z.string({ message: "Field is required" });
z.number({ message: "Must be a number" });

// ❌ WRONG - Zod v3 (DO NOT USE)
z.string({ required_error: "Field is required" });
z.number({ invalid_type_error: "Must be a number" });
```

#### Key Changes from v3 to v4

| v3 (OLD)             | v4 (NEW)  |
| -------------------- | --------- |
| `required_error`     | `message` |
| `invalid_type_error` | `message` |
| `errorMap`           | `error`   |

---

## Admin CMS Features

Building or restructuring anything under `src/app/admin/cms/`? Invoke the
`cms-scaffold` skill — it carries the folder shape, file naming, service layer
and API route conventions for a CMS feature.

---

## Enum / Status Single Source of Truth — STRICTLY FOLLOW

For any value backed by a Prisma enum (e.g. `StatusPendaftaran`, `UserStatus`, `StudentStatus`), **never** hardcode its valid values, labels, or badge/color variants in more than one place. Define an options array once in `src/lib/constants.ts` and derive every label map, badge-variant map, and "is valid" check from it.

```tsx
// ✅ CORRECT - src/lib/constants.ts (single source of truth)
export const statusPendaftaranOptions = [
  { value: "PENDING", label: "Menunggu", badge: "warning" as const },
  { value: "DIVERIFIKASI", label: "Terverifikasi", badge: "info" as const },
  { value: "DITERIMA", label: "Diterima", badge: "success" as const },
  { value: "DITOLAK", label: "Ditolak", badge: "destructive" as const },
] as const;

export const STATUS_PENDAFTARAN_VALUES = statusPendaftaranOptions.map((o) => o.value);
export const STATUS_PENDAFTARAN_LABELS: Record<string, string> = Object.fromEntries(
  statusPendaftaranOptions.map((o) => [o.value, o.label]),
);
export const STATUS_PENDAFTARAN_BADGES: Record<string, "success" | "warning" | "info" | "destructive"> =
  Object.fromEntries(statusPendaftaranOptions.map((o) => [o.value, o.badge]));

// ✅ CORRECT - consuming code imports from constants.ts
import { STATUS_PENDAFTARAN_LABELS, STATUS_PENDAFTARAN_BADGES } from "@/src/lib/constants";
const variant = STATUS_PENDAFTARAN_BADGES[status] ?? "warning";

// ❌ WRONG - re-declaring the same values/labels/variants locally
const validStatuses = ["PENDING", "DIVERIFIKASI", "DITOLAK", "DITERIMA"];
const STATUS_LABEL = { PENDING: "Menunggu", DIVERIFIKASI: "Terverifikasi", ... };
switch (status) {
  case "DITERIMA": variant = "success"; break;
  // ...
}
```

- Always import status/enum badges from `src/app/admin/_components/Badge.tsx` (variants: `success | warning | info | destructive | default | secondary | outline`) — it is a superset of shadcn's `src/components/ui/badge.tsx`. **Never import `Badge` from `src/components/ui/badge` for enum/status pills.** This keeps exactly one badge-variant system, so each options array only ever needs a single `badge` field — no `adminBadge`/`uiBadge` split.
- Before adding a new label/variant switch, ternary chain, or literal array for an existing enum, search the codebase for the enum's values first; if a constants entry already exists, import it instead of duplicating it.
- Delete duplicate/dead status-mapping helpers when found — don't keep them "just in case."

---

## Unit Testing — MANDATORY RULE

**EVERY time you create a new file in `src/features/` or `src/app/api/`, you MUST also create a corresponding test file.**

### Test File Placement

| Source file                           | Test file                                  |
| ------------------------------------- | ------------------------------------------ |
| `src/features/[feat]/services/foo.ts` | `src/features/[feat]/services/foo.test.ts` |
| `src/features/[feat]/utils/bar.ts`    | `src/features/[feat]/utils/bar.test.ts`    |
| `src/features/[feat]/hooks/useBaz.ts` | `src/features/[feat]/hooks/useBaz.test.ts` |
| `src/app/api/[route]/route.ts`        | `src/app/api/[route]/route.test.ts`        |

### What to Test

- **Services:** mock `prisma` with `vi.mock`, test each exported function
- **Utils:** pure functions — test all branches and edge cases
- **Hooks:** use `renderHook` from `@testing-library/react`
- **API routes:** mock `prisma`, assert response status + body

### Minimum Coverage Requirement

Every new feature file must have at least:

- 1 happy-path test
- 1 error/edge-case test

Run `pnpm test:run` before marking any task complete.

---

## Component Splitting Rules - STRICTLY FOLLOW

### Rule 1: Split by Section

Each distinct section of a page should be its own component — a page file
composes sections, it never inlines them.

### Rule 2: Component Naming Convention

| Type              | Pattern             | Example                                     |
| ----------------- | ------------------- | ------------------------------------------- |
| Section Component | `[Name]Section.tsx` | `HeroSection.tsx`, `FacilitiesSection.tsx`  |
| List Component    | `[Name]List.tsx`    | `NewsList.tsx`, `ProgramList.tsx`           |
| Card Component    | `[Name]Card.tsx`    | `NewsCard.tsx`, `TestimonialCard.tsx`       |
| Form Component    | `[Name]Form.tsx`    | `ProgramForm.tsx`, `NewsForm.tsx`           |
| Table Component   | `[Name]Table.tsx`   | `ProgramTable.tsx`, `NewsTable.tsx`         |
| Dialog/Modal      | `[Name]Dialog.tsx`  | `DeleteDialog.tsx`, `EditProgramDialog.tsx` |
| Action Component  | `[Name]Actions.tsx` | `TableActions.tsx`, `RowActions.tsx`        |

### Rule 3: File Size Limit

- If a component exceeds **150 lines**, split it into smaller components
- Extract repeated UI patterns into separate components

---

## World-Class Code Standards - STRICTLY FOLLOW

Every change must meet these bars before it's considered done. This is not optional polish — it's the baseline.

### 1. Performance & Rendering

- **Default to Server Components.** Only add `"use client"` when the component needs interactivity (state, effects, browser APIs, event handlers). Push `"use client"` as far down the tree as possible — wrap just the interactive leaf, not the whole page.
- **Fetch data where it's used, in parallel.** Use `Promise.all` for independent queries in a server component (see `AdminPage` pattern) instead of sequential `await`s.
- **Every route segment that does async data fetching must have a `loading.tsx`** (reusing a shared loading component per the DRY rule) so navigation always gives instant feedback — never a silent, unresponsive gap.
- **Paginate or limit any list that can grow unbounded** (tables, feeds) — never `findMany()` without a `take`/cursor on data that isn't inherently small and fixed.

### 2. Error Handling & Resilience

- **Every async view has four states, not just the happy path:** loading (`loading.tsx` / skeleton), empty (explicit "no data" UI, not a blank table), error (`error.tsx` or inline error UI), and success.
- **Every route segment with a real failure mode gets an `error.tsx`** (a Client Component) so a thrown error doesn't blank the whole app.
- **Server actions and API routes must catch and translate errors**, never let a raw Prisma/DB error reach the client. Return a typed `{ error: string }` shape or throw a `NextResponse` with an appropriate status.
- **Client-side async calls (mutations, fetches) must have both a loading state (disable the button / show a spinner) and a failure path (toast + don't silently swallow).** No fire-and-forget `.then()` without a `.catch` or try/catch.
- **Never let a caught error be discarded silently** — at minimum log it; ideally surface it to the user via `toast.error`.

### 3. Security & Data Validation

- **Every API route and Server Action must validate its input with Zod before touching the database** — never trust `request.json()` or form data directly.
- **Every API route and Server Action must check authentication/authorization first**, using `getCurrentUser()` / `canAccessAdmin()` (or the route's equivalent) before running any logic — never assume the UI already gated access, since the endpoint itself must not trust the caller.
- **Never expose Prisma errors, stack traces, or internal messages to the client** — map them to a safe generic message.
- **Never trust an ID from the client as authorization** — always scope queries to the authenticated user/role (e.g. don't fetch `prisma.registration.findUnique({ where: { id } })` for a mutation without also checking the requester is allowed to touch that record, if ownership matters for that resource).
- **Secrets (API keys, DB URLs, service tokens) only ever live in environment variables**, never hardcoded, never logged, never sent to the client bundle unless prefixed `NEXT_PUBLIC_` and genuinely safe to expose.
- **Sanitize/escape any user-supplied content rendered as HTML** (e.g. rich text from CMS fields) — never `dangerouslySetInnerHTML` on unsanitized input.

### 4. Self-Review Checklist — run before marking any task complete

1. **DRY check:** did I duplicate any component, constant, type, or util that already exists or that I just wrote elsewhere? Extract if so.
2. **States covered:** loading / empty / error / success all handled for any new async UI.
3. **Validation & auth:** every new API route / Server Action validates input with Zod and checks auth before mutating data.
4. **Tests:** new files under `src/features/` or `src/app/api/` have a corresponding `.test.ts` with at least one happy-path and one error-case test.
5. **Lint & types pass:** run `pnpm lint` and `pnpm test:run` (or the project's typecheck script) — don't hand off code that doesn't pass.
6. **No dead code:** remove unused imports, commented-out blocks, and superseded duplicate helpers touched during the change.
