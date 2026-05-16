# Project Guidelines for Claude

## Project Overview

Enterprise Next.js school website with TypeScript, Tailwind CSS, Shadcn/ui, Prisma, and Supabase.

---

## Design System - STRICTLY FOLLOW

All designs must follow the 3-color design system defined in `src/app/globals.css`.

### Base Colors

| Color   | Hex Code  | Usage                        |
| ------- | --------- | ---------------------------- |
| Primary | `#32368C` | Navy blue - main brand color |
| Green   | `#4CAF93` | Teal/mint - success states   |
| Yellow  | `#F2C94C` | Golden - warnings, accents   |

### Color Scales Available (50-950)

- **Primary**: `primary-50` to `primary-950` (navy blue)
- **Green**: `green-50` to `green-950` (teal/mint)
- **Yellow**: `yellow-50` to `yellow-950` (golden)

### Color Usage Guidelines

1. Use **primary** colors for main UI elements, buttons, and brand identity
2. Use **green** colors for success states, confirmations, and positive actions
3. Use **yellow** colors for warnings, highlights, and attention-grabbing elements
4. Use lighter shades (50-300) for backgrounds
5. Use mid-range shades (400-600) for interactive elements
6. Use darker shades (700-950) for text and emphasis

### Tailwind Usage

```jsx
className = "bg-primary-500 text-primary-50";
className = "bg-green-500 text-green-50";
className = "bg-yellow-400 text-yellow-950";
```

---

## Folder Structure - STRICTLY FOLLOW

```
src/
├── app/                          # Next.js App Router - routes ONLY
│   ├── (public)/                 # Public pages group
│   │   ├── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── _components/      # Page-specific components ONLY
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected pages group
│   │   ├── dashboard/
│   │   ├── courses/
│   │   │   └── _components/      # Page-specific components ONLY
│   │   └── layout.tsx
│   └── api/                      # API routes
│       └── [feature]/
├── features/                     # Business logic by domain
│   └── [feature-name]/
│       ├── components/           # Shared within feature (2+ uses)
│       ├── hooks/
│       ├── services/             # API calls
│       ├── types/                # TypeScript interfaces
│       └── utils/
├── components/                   # Global shared components
│   ├── ui/                       # Shadcn components
│   ├── layout/                   # Header, Footer, Sidebar
│   └── common/                   # LoadingSpinner, ErrorMessage
└── lib/                          # Global utilities, DB client
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

## Technology Stack

| Category        | Technology                          |
| --------------- | ----------------------------------- |
| Framework       | Next.js 14+ (App Router)            |
| Language        | TypeScript (strict mode)            |
| Styling         | Tailwind CSS + Shadcn/ui            |
| Icons           | Lucide React                        |
| Database        | Prisma ORM + Supabase PostgreSQL    |
| Forms           | React Hook Form + Zod               |
| Server State    | React Query (@tanstack/react-query) |
| Client State    | Zustand (if needed)                 |
| Package Manager | pnpm (ALWAYS use pnpm, NOT npm)     |

---

## Package Manager - STRICTLY FOLLOW

**ALWAYS use pnpm and pnpx instead of npm and npx:**

```bash
# Installing packages
pnpm install           # NOT npm install
pnpm add <package>     # NOT npm install <package>
pnpm add -D <package>  # NOT npm install -D <package>

# Running scripts
pnpm dev               # NOT npm run dev
pnpm build             # NOT npm run build

# Running CLI tools
pnpx prisma migrate dev    # NOT npx prisma migrate dev
pnpx prisma generate       # NOT npx prisma generate
```

---

## Naming Conventions

- **Components:** PascalCase (`CourseCard.tsx`)
- **Utilities:** camelCase (`formatDate.ts`)
- **API routes:** kebab-case folders (`api/courses/`)
- **Page-specific:** Add context prefix (`PublicCourseCard`, `DashboardCourseCard`)

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

## Red Flags - NEVER DO

- Putting page-specific components in `features/`
- Duplicating types across features
- Creating new components without checking `components/ui/`
- Using `any` type
- Skipping Zod validation in API routes
- Not using Prisma client singleton
- Mixing server and client components incorrectly

---

## Before Creating Any Component - ASK:

1. Where will this component be used?
2. Does a similar component exist?
3. What's the feature domain?
4. Should this use an existing Shadcn component?
5. Does this need to be a server or client component?

---

## Component Splitting Rules - STRICTLY FOLLOW

### Rule 1: Split by Section

Each distinct section of a page should be its own component.

```tsx
// ✅ GOOD - page.tsx is clean, sections are split
export default function ProfilPage() {
  return (
    <main>
      <HeroSection />
      <VisionMissionSection />
      <FacilitiesSection />
    </main>
  );
}

// ❌ BAD - everything in one file
export default function ProfilPage() {
  return (
    <main>
      <section>{/* 100 lines of hero */}</section>
      <section>{/* 100 lines of vision */}</section>
    </main>
  );
}
```

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

## Admin CMS Page Structure - STRICTLY FOLLOW

### Folder Structure for CMS Pages

```
src/app/admin/cms/[feature]/
├── page.tsx                    # Main list page (server component)
├── [id]/
│   └── page.tsx               # Edit page
├── create/
│   └── page.tsx               # Create page
└── _components/
    ├── [Feature]Table.tsx     # Data table component
    ├── [Feature]Form.tsx      # Create/Edit form
    ├── [Feature]Card.tsx      # Card view (if needed)
    ├── [Feature]Actions.tsx   # Row actions (edit, delete)
    ├── [Feature]Columns.tsx   # Table column definitions
    ├── [Feature]Schema.tsx    # Zod validation schema
    └── Delete[Feature]Dialog.tsx  # Delete confirmation
```

### Example: News CMS Structure

```
src/app/admin/cms/news/
├── page.tsx                   # List all news
├── [id]/
│   └── page.tsx              # Edit news
├── create/
│   └── page.tsx              # Create news
└── _components/
    ├── NewsTable.tsx
    ├── NewsForm.tsx
    ├── NewsColumns.tsx
    ├── NewsActions.tsx
    ├── NewsSchema.ts
    └── DeleteNewsDialog.tsx
```

### CMS Page Patterns

#### List Page (page.tsx)

```tsx
// Server component - fetches data
import { NewsTable } from "./_components/NewsTable";
import { getNews } from "@/src/features/cms/services/news";

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berita"
        description="Kelola berita dan pengumuman"
        action={<CreateButton href="/admin/cms/news/create" />}
      />
      <NewsTable data={news} />
    </div>
  );
}
```

#### Form Component Pattern

```tsx
// Client component - handles form
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema, type NewsFormData } from "./NewsSchema";

export function NewsForm({ defaultValues, onSubmit }: NewsFormProps) {
  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues,
  });

  return <Form {...form}>{/* form fields */}</Form>;
}
```

---

## Features Folder for CMS - Business Logic

```
src/features/cms/
├── services/                  # API/Database calls
│   ├── news.ts
│   ├── programs.ts
│   ├── testimonials.ts
│   └── ...
├── types/                     # Shared TypeScript types
│   └── index.ts
└── utils/                     # CMS utilities
    └── slug.ts
```

### Service Pattern

```tsx
// src/features/cms/services/news.ts
import { prisma } from "@/src/lib/prisma";

export async function getNews() {
  return prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getNewsById(id: string) {
  return prisma.news.findUnique({ where: { id } });
}

export async function createNews(data: CreateNewsInput) {
  return prisma.news.create({ data });
}

export async function updateNews(id: string, data: UpdateNewsInput) {
  return prisma.news.update({ where: { id }, data });
}

export async function deleteNews(id: string) {
  return prisma.news.delete({ where: { id } });
}
```

---

## Shared Admin Components

Place reusable admin components in:

```
src/app/admin/_components/
├── AdminSidebar.tsx           # Already exists
├── PageHeader.tsx             # Page title + action button
├── DataTable.tsx              # Generic data table wrapper
├── DeleteDialog.tsx           # Reusable delete confirmation
├── FormCard.tsx               # Card wrapper for forms
├── StatusBadge.tsx            # Active/Inactive badge
└── ImageUpload.tsx            # Image upload component
```

---

## API Routes for CMS

```
src/app/api/cms/
├── news/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE
├── programs/
│   ├── route.ts
│   └── [id]/route.ts
└── ...
```

### API Route Pattern

```tsx
// src/app/api/cms/news/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { newsSchema } from "@/src/app/admin/cms/news/_components/NewsSchema";

export async function GET() {
  const news = await prisma.news.findMany();
  return NextResponse.json(news);
}

export async function POST(request: Request) {
  const body = await request.json();
  const validated = newsSchema.parse(body);
  const news = await prisma.news.create({ data: validated });
  return NextResponse.json(news, { status: 201 });
}
```
