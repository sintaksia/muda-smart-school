# Muda Smart School — Design System

**This is the single source of truth for the design system.** Color, typography,
radius and elevation rules live here and nowhere else — `CLAUDE.md` and
`README.md` link here rather than restating the tables.

It replaces the previous "Banking / Fintech (Jago-inspired)" system, which
didn't belong on a school site. This version keeps the navy/green/gold school
brand and keeps the discipline: one radius per tier, hairline-first elevation.

**Status:** implemented — color, typography, radius, elevation and the
component baseline (see §7).

---

## 1. Scope

**The system is:**

- `--primary-*` scale (navy, `#32368C`)
- `--green-*` scale (success/growth, `#4CAF93`)
- `--yellow-*` scale (accent/warning, `#F2C94C`)
- Semantic tokens `--primary`, `--secondary`, `--muted`, `--destructive`,
  `--foreground`, `--border`, etc.
- Three radius tiers and three elevation levels (§4, §5)

**Removed in the reconciliation** (the fintech overlay in `globals.css`):
`--color-brand*`, `--color-teal*`, `--color-surface`, `--color-hairline*`,
`--color-ink*`, `--color-success/warning/danger/info`, `--radius-input/card/modal`,
`--shadow-card/modal/hover`.

> **Correction to the original plan.** That block was described as unused
> ("0 real UI need"). It was not: `border-hairline`, `text-ink*`, `bg-brand*`
> and `text-danger` had **294 call sites**, concentrated in the `guru` and
> `siswa` portals and parts of `admin`, plus three raw `var(--color-brand)`
> references in arbitrary values. Deleting the tokens required remapping every
> one of them (§2). Don't repeat the "it's unused, just delete it" reasoning
> without grepping first.

---

## 2. Color

### 2.1 Brand base

| Color   | Hex       | Usage                        |
| ------- | --------- | ---------------------------- |
| Primary | `#32368C` | Navy blue — main brand color |
| Green   | `#4CAF93` | Teal/mint — success states   |
| Yellow  | `#F2C94C` | Golden — warnings, accents   |

Each has a full `50`–`950` scale as Tailwind utilities:

```jsx
className = "bg-primary-500 text-primary-50";
className = "bg-green-500 text-green-50";
className = "bg-yellow-400 text-yellow-950";
```

General shade guidance: `50–300` backgrounds, `400–600` interactive elements,
`700–950` text and emphasis.

### 2.2 Semantic roles

| Role             | Token                                   | Hex                 |
| ---------------- | --------------------------------------- | ------------------- |
| Primary / brand  | `primary-900`                           | `#32368C`           |
| Primary hover    | `primary-800`                           | `#3A3D81`           |
| Primary active   | `primary-950`                           | `#1F2154`           |
| Success          | `green-600`                             | `#0E9474`           |
| Warning / accent | `yellow-600` (on light) or `yellow-400` | `#CA8A04`/`#F2C94C` |
| Danger           | `--destructive`                         | `#EF4444`           |
| Body text        | `--foreground`                          | `neutral-900`       |
| Secondary text   | `neutral-600`                           | `#52525B`           |
| Muted text       | `--muted-foreground`                    | `neutral-500`       |
| Hairline border  | `--border`                              | `neutral-200`       |

Hover/active were an open question in the original spec ("audit which shade
reads as hover"). **Resolved:** `primary-600` reads too light against
`primary-900`; the ladder is `900 → 800 (hover) → 950 (active)`.

### 2.3 Mapping applied when the fintech tokens were removed

Reference for anyone reading old commits or branches:

| Removed                             | Replacement                                          |
| ----------------------------------- | ---------------------------------------------------- |
| `brand` / `brand-600` / `brand-700` | `primary-900` / `primary-800` / `primary-950`        |
| `brand-50` / `brand-100`            | `primary-50` / `primary-100`                         |
| `teal` / `teal-600` / `teal-700`    | `green-600` / `green-500` / `green-700`              |
| `surface`                           | `muted`                                              |
| `hairline` / `hairline-strong`      | `border` / `neutral-300`                             |
| `ink` / `ink-secondary`/`ink-muted` | `foreground`/`neutral-600`/`muted-foreground`        |
| `success`/`warning`/`danger`/`info` | `green-600`/`yellow-600`/`destructive`/`primary-900` |

### 2.4 Off-palette hues — rule and exceptions

Default Tailwind hues (`blue-*`, `purple-*`, `indigo-*`, `emerald-*`, …) must
**not** be used for brand, layout, or state. Use the scales above.

**Three legitimate exceptions — do not sweep these into the brand palette:**

1. **Third-party brand colors.** `src/lib/social-icons.ts` — Instagram,
   Facebook, YouTube etc. must render in their own colors.
2. **Categorical encoding.** Distinct hues that make categories, levels or
   tiers distinguishable at a glance. Collapsing them into navy/green/gold
   destroys the distinction — and worse, an "else" branch rendered in the
   page's own brand color stops reading as a separate state. Covers:
   - `*Columns.tsx` (`AchievementColumns`, `GalleryColumns`, `ContactsColumns`,
     `SocialLinksColumns`, `ExtracurricularColumns`) and `StatsCards`
   - **medal tier** — gold/silver/bronze in `PrestasiCard`,
     `PrestasiListSection`. Bronze is legitimately `orange-*`.
   - **achievement level** — `NATIONAL` / `PROVINCE` / other in `PrestasiCard`,
     `AwardsSection`, `VisionMissionSection`.
3. **`red-*` for destructive affordances** in admin (`DeleteDialog`,
   `UserActions`, `CmsRowActions`) — semantically equivalent to
   `--destructive`; prefer `--destructive` in new code, but existing usage is
   not a bug.

Anything outside those three is a one-off and should be remapped.

Files covered by an exception carry a file-level
`/* eslint-disable ds/off-palette -- <reason> */` so the remaining
`ds/off-palette` warnings are real signal, not noise. If you add an
exception, write the reason — a bare disable is not acceptable.

---

## 3. Typography

Inter is already correctly wired (`next/font/google` in `layout.tsx`) — no font
change needed. Only the **scale** needs standardizing.

Applied to every heading element. `text-5xl`/`text-6xl` are gone; hero
headings use `text-3xl md:text-4xl font-extrabold tracking-tight` (H1 on
mobile, Display at `md`). Body and lead paragraphs still use `text-lg`/`text-2xl`
in ~48 places — the table's Body row governs body copy, and shrinking lead
paragraphs to `text-sm` is a separate decision, not part of this pass.

> The H1 row previously read 28px, which no Tailwind class produces
> (`text-3xl` is 30px). That error had leaked into `guru/page.tsx` and
> `LiveSessionView.tsx` as hand-rolled `text-[28px]`; both now use `text-3xl`.

| Role        | Class                                            | Size / Weight |
| ----------- | ------------------------------------------------ | ------------- |
| Display     | `text-4xl font-extrabold tracking-tight`         | 36px / 800    |
| H1          | `text-3xl font-bold tracking-tight`              | 30px / 700    |
| H2          | `text-xl font-bold`                              | 20px / 700    |
| H3          | `text-base font-semibold`                        | 16px / 600    |
| Body        | `text-sm`                                        | 14px / 400    |
| Caption     | `text-xs font-medium text-muted-foreground`      | 12px / 500    |
| Micro label | `text-[11px] font-bold uppercase tracking-wider` | 11px / 700    |

---

## 4. Radius — three tiers

Defined in `globals.css`; the standard Tailwind utilities do the work, no
custom radius names:

```css
:root {
  --radius: 16px;
}

@theme inline {
  --radius-sm: 10px; /* inputs, chips, small buttons, badges, icon tiles */
  --radius-md: 16px; /* standard cards — the default */
  --radius-lg: 20px; /* hero cards, modals, dialogs, large media */
  --radius-xl: 20px; /* alias to lg — never exceed 20px */
  /* Guardrails so a stray utility can't exceed the ceiling */
  --radius-2xl: 20px;
  --radius-3xl: 20px;
  --radius-4xl: 20px;
}
```

### 4.1 Migration map

| Old class                                   | New class                                               | Applies to                   |
| ------------------------------------------- | ------------------------------------------------------- | ---------------------------- |
| `rounded-input`                             | `rounded-sm`                                            | inputs, small buttons, chips |
| `rounded-card`                              | `rounded-md`                                            | standard cards               |
| `rounded-modal`                             | `rounded-lg`                                            | modals, dialogs, sheets      |
| `rounded-md` **on inputs/small controls**   | `rounded-sm`                                            | see 4.2                      |
| `rounded-md` **on cards/containers**        | keep `rounded-md`                                       | —                            |
| `rounded-lg`/`rounded-xl` on inputs/buttons | `rounded-sm`                                            | —                            |
| `rounded-lg`/`rounded-xl` on cards          | `rounded-md`                                            | —                            |
| `rounded-2xl`                               | `rounded-md` (cards) / `rounded-lg` (hero, large media) | judge by context             |
| `rounded-full` on buttons or cards          | `rounded-sm`                                            | see 4.3                      |
| `rounded-full` on avatars, dots, badges     | keep `rounded-full`                                     | correct usage, do not touch  |

### 4.2 The `rounded-md` trap

`--radius-md` went from 8px to 16px in this redefinition, so **every
pre-existing `rounded-md` silently doubled.** When you see `rounded-md`, decide
what the element is:

- input, textarea, select trigger, menu row, tab, tooltip, icon tile,
  thumbnail, small button → **`rounded-sm`**
- card, table container, panel, media preview → **keep `rounded-md`**

### 4.3 `rounded-full` — decided cases

Never find-and-replace this. The judgments already made:

**Converted to `rounded-sm`** (they are buttons, not pills):

- segmented toggle groups — `JadwalGridView`, `JadwalManager`
- category filter buttons — `GaleriGallerySection`
- section nav pills — `QuickNav`
- suggestion chips — `AIChatWidget`

**Kept `rounded-full`** — correct as circles/pills:

- avatars, status dots, color swatches, all `Badge`/`StatusBadge` pills
- decorative blurred background blobs
- circular icon buttons where the round shape is the convention: the
  `AIChatWidget` FAB, `Footer` social buttons, `FacilityCard` carousel arrows,
  `GalleryMultiPicker` thumbnail delete badge, the `ProgramForm` tag chip and
  its inline `×`

The last group is a deliberate exception, not an oversight. If you want them
squared off, that's a design decision — make it once, here.

---

## 5. Elevation — hairline border first, shadow second

```css
--shadow-xs: 0 1px 2px rgba(27, 28, 51, 0.05);
--shadow-sm: 0 2px 8px rgba(27, 28, 51, 0.07);
--shadow-md: 0 8px 24px rgba(27, 28, 51, 0.1);
```

Rules:

- **Resting cards:** `border border-border` only, no shadow.
- **Interactive/hoverable cards:** add `hover:shadow-sm` only.
- **Modals, dropdowns, popovers, sheets:** `shadow-md`.
- **Buttons:** no shadow (`outline` variant keeps `shadow-xs`).
- `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-2lg`, `shadow-yellow-*`,
  `shadow-primary-*` are **banned**. None remain in the codebase.
- A card that had a shadow but **no** border gets `border border-border` when
  the shadow is removed — don't leave it edgeless.
- `drop-shadow-*` is a filter, not elevation. It is out of scope here and is
  fine on text/images.

---

## 6. Component baseline

| Component                                | Rule                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| `ui/button.tsx`                          | `rounded-sm` on base and on `sm`/`lg` sizes; no shadow |
| `ui/card.tsx`                            | `rounded-md` + `border`; **no** default `shadow-sm`    |
| `ui/input`, `textarea`, `select` trigger | `rounded-sm`                                           |
| `ui/tabs` list + trigger                 | `rounded-sm`                                           |
| `ui/tooltip`                             | `rounded-sm`                                           |
| `ui/dialog`, `alert-dialog`, `sheet`     | `rounded-lg` + `shadow-md`                             |
| `ui/dropdown-menu`, `select` content     | `rounded-md` + `shadow-md`                             |
| `ui/sidebar` menu rows                   | `rounded-sm`                                           |
| `ui/badge`, `admin/Badge`, `StatusBadge` | `rounded-full` — unchanged by design                   |

Use `src/app/admin/_components/Badge.tsx` for enum/status pills (it is a
superset of the shadcn badge). See the enum single-source-of-truth rule in
`CLAUDE.md`.

### 6.1 Form primitives — which element to reach for

The table above says how the primitives are styled. This section says that you
must use them. A hand-rolled `<select className="rounded-sm …">` passes every
class-level guardrail and still produces a control with a different popover, a
different focus ring and a different keyboard model from the one two pages
over. That is how this app ended up with two unrelated dropdowns.

| Need                                    | Use                                                 |
| --------------------------------------- | --------------------------------------------------- |
| Dropdown, plain `value` / `onChange`    | `components/common/SelectField`                     |
| Dropdown, react-hook-form via `control` | `components/common/FormSelect`                      |
| Dropdown over a long, data-driven list  | the same two, with `searchable`                     |
| Dropdown inside a shadcn `<Form>`       | `FormField` + `ui/select` (see `JadwalSelectField`) |
| Text / number / date / email / password | `ui/input`                                          |
| Multi-line text                         | `ui/textarea`                                       |
| Anything shaped like a button           | `ui/button`                                         |

`ds/native-form-elements` enforces this as an **error** for `<select>`,
`<textarea>` and `<input>`. `src/components/ui/**` is exempt — those files are
the primitives.

**The `<input>` exceptions**, allowed because no shadcn primitive exists:
`type="file"`, `"checkbox"`, `"radio"`, `"range"`. Nothing else.

**`<button>` is deliberately not banned.** It is also the correct element for a
custom interactive surface — a gallery tile, a sortable table header, a chip's
remove affordance, a segmented-control segment — and shadcn's own primitives
are built on it. Use `ui/button` when the thing _looks like a button_ (has a
height, padding, a fill or a border); use a native `<button>` when you are
making some other element clickable. Do not wrap a tile in `<Button
variant="ghost" className="h-auto p-0 hover:bg-transparent">` to satisfy a rule
— that is worse code.

**Sizing overrides** live in `components/common/formClasses.ts`
(`ADMIN_FIELD_CLASS` for the 44px master-data forms, `FILTER_FIELD_CLASS` for
compact filter bars). Layer them on a primitive; never re-declare a local
`inputClass` string.

**Long lists get a search box.** Any dropdown whose options come from the
database — students, teachers, classes, subjects, credit owners — passes
`searchable` to `SelectField` / `FormSelect`. That swaps the Radix Select for
`components/common/ComboboxField` (Popover + `ui/command`), which keeps the same
trigger, the same `value`/`onChange` contract and the same empty-value handling,
and adds a filter box. Matching is on the label only, so an id never scores
against the query, and the list renders at most 100 matches with a
"Menampilkan X dari Y" note below it. Leave `searchable` off for fixed enums
(status, hari, jenis kelamin) — a search box over six options is friction.

**Why the wrappers exist:** Radix `SelectItem` throws on `value=""`, but our
filters and nullable fields use `""`/`null` for "no value".
`components/common/selectSentinel.ts` translates between the two, so no caller
has to invent a sentinel — inventing one per file is what pushed several forms
back onto native `<select>` originally.

### 6.2 Where a form lives — popup or its own page, never inline

A create/edit form is **never** rendered inline above the table it feeds. Only
two shapes are allowed:

| Form                                                | Shape                                                         |
| --------------------------------------------------- | ------------------------------------------------------------- |
| Short-to-medium create/edit, list stays in view     | `components/common/FormDialog` opened by `admin/CreateButton` |
| Long form with its own URL (CMS entries, user edit) | A dedicated `create/` or `[id]/` route                        |

An inline form pushes the table below the fold, occupies the page whether or
not anyone is creating anything, and gives no cancel affordance — which is why
`admin/kelas`, `admin/mapel`, `admin/absensi/guru`, `admin/absensi/kredit` and
the student izin card were converted.

**Filters are the exception, and the only one.** A filter bar sits inline above
the table, uses `FILTER_FIELD_CLASS`, and shares the header row with the
`CreateButton` on its right. If a control narrows what the table shows, it
belongs in that row; if it writes a record, it belongs in the dialog.

The pieces:

| Piece                                 | Job                                                               |
| ------------------------------------- | ----------------------------------------------------------------- |
| `components/common/FormDialog`        | The shell — title, description, `sm`/`md`/`lg`/`xl` width, scroll |
| `components/common/FormDialogActions` | The `Batal` + submit row, inside the `<form>`                     |
| `admin/_components/CreateButton`      | The one "Tambah …" affordance — pass `href` **or** `onClick`      |
| `lib/apiRequest`                      | The mutation call, surfacing the route's `{ error }` message      |

Do not hand-roll `<Dialog><DialogContent>` for a form, and do not restyle the
create button with a local `bg-primary-900 …` string — both existed in this
codebase and both drifted.

---

## 7. Status

- [x] Fintech-only tokens deleted from `globals.css` (§1)
- [x] 294 token call sites remapped to the brand scales (§2.3)
- [x] `--radius-sm/md/lg` redefined + 20px ceiling guardrail (§4)
- [x] `--shadow-xs/sm/md` redefined (§5)
- [x] `button.tsx` and `card.tsx` updated (§6)
- [x] `rounded-full` on buttons/cards converted; pills/avatars left alone (§4.3)
- [x] Ad hoc `shadow-lg/xl/2xl/2lg/yellow/primary` removed (§5)
- [x] Color/radius/elevation single-sourced into this file
- [x] `pnpm lint` and `pnpm build` pass
- [x] §3 typography scale applied to all headings; display capped at `text-4xl`
- [x] Off-palette one-offs reviewed — 11 remapped (amber→yellow, emerald→green);
      medal-tier and achievement-level encoding confirmed as §2.4 exceptions and
      marked with reasoned eslint-disables
- [~] Smoke test: all 10 public routes compile and return 200, and the served
  HTML contains only `rounded-sm/md/lg/full` with no banned classes.
  **Pixel-level visual review still outstanding** — needs a human or a browser.
