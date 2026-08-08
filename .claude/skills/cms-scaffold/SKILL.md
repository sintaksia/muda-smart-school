---
name: cms-scaffold
description: File layout and naming conventions for building a new Admin CMS feature (list/create/edit pages, table, form, actions, Zod schema, service layer, API routes). Use when adding or restructuring anything under src/app/admin/cms/.
---

# Admin CMS Scaffolding

Conventions for a new CMS feature. The general rules in `CLAUDE.md` (component
placement, DRY, naming, design system, testing) still apply — this only covers
the CMS-specific shape.

## Page folder

```
src/app/admin/cms/[feature]/
├── page.tsx                       # List page (server component)
├── [id]/page.tsx                  # Edit page
├── create/page.tsx                # Create page
└── _components/
    ├── [Feature]Table.tsx         # Data table
    ├── [Feature]Form.tsx          # Create/edit form (client component)
    ├── [Feature]Columns.tsx       # Table column definitions
    ├── [Feature]Actions.tsx       # Row actions (edit, delete)
    ├── [Feature]Schema.ts         # Zod schema — shared with the API route
    └── Delete[Feature]Dialog.tsx  # Delete confirmation
```

`src/app/admin/cms/news/` is the reference implementation — copy its shape.

## Business logic

```
src/features/cms/
├── services/[feature].ts    # all Prisma access; get/getById/create/update/delete
├── types/index.ts           # shared types
└── utils/                   # e.g. slug.ts
```

The list page is a server component that calls the service directly; the form is
a client component using `useForm` + `zodResolver` with the schema from
`_components/[Feature]Schema.ts`.

## API routes

```
src/app/api/cms/[feature]/
├── route.ts          # GET (list), POST (create)
└── [id]/route.ts     # GET, PUT, DELETE
```

Import the **same** Zod schema the form uses — never redeclare it. Every route
validates input with Zod and checks auth before touching the database, and every
new route file needs a co-located `route.test.ts`.
