# AGENTS.md — Jira Clone

Compact guidance for OpenCode sessions working in this repository.

## Quick Commands

```bash
# Start dev server
bun dev    # or npm run dev, yarn dev

# Lint & typecheck (run before committing)
npm run lint

# Format code
npm run format:fix

# Build for production
npm run build
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Backend**: Hono API routes (v4.6.7) with Drizzle ORM + SQLite
- **Auth**: Cookie-based sessions (NOT Appwrite - see note below)
- **State**: TanStack Query v5 + nuqs (URL query state)
- **UI**: Tailwind CSS + shadcn/ui-style Radix primitives + Lucide icons
- **Package Manager**: bun (uses bun.lockb)

> **Important**: The README mentions Appwrite, but the codebase now uses **local SQLite + Drizzle** for data storage. The Appwrite config (`src/lib/appwrite.ts`) exists but is likely unused in the current implementation.

## Architecture Overview

### API Routes (`src/app/api/[[...route]]/route.ts`)

All API endpoints are implemented with **Hono** mounted as Next.js Route Handlers:

```
/api/auth/*      → src/features/auth/server/route.ts
/api/members/*   → src/features/members/server/route.ts
/api/projects/*  → src/features/projects/server/route.ts
/api/tasks/*     → src/features/tasks/server/route.ts
/api/workspaces/* → src/features/workspaces/server/route.ts
```

### Feature Modules

Each feature (`src/features/*/`) follows a consistent pattern:
- `api/` — React Query hooks for client-side data fetching
- `components/` — UI components
- `hooks/` — Custom hooks
- `server/route.ts` — Hono API handler for this domain
- `types.ts` — TypeScript types
- `schema.ts` — Zod validation schemas (if applicable)

### Database

- **Location**: `src/db/schema.ts` (Drizzle SQLite schema)
- **Models**: users, workspaces, members, projects, tasks, sessions

## Key Conventions

### 1. API Client Usage

```typescript
// Client uses hono.ts for typed API calls
import { client } from '@/lib/hono';
const res = await client.tasks['$get']({ query: { workspaceId: 'xxx' } });
```

### 2. React Query Patterns

```typescript
// Custom hook pattern
const { data, isLoading } = useGetTasks({ workspaceId, projectId });
```

### 3. URL State (nuqs)

URL query params are used for task filters. Changes to filters update the URL automatically via nuqs.

### 4. Component Organization

- **UI primitives**: `src/components/ui/` (Radix-based, shadcn-like)
- **Feature components**: `src/features/*/components/`
- **Layout components**: `src/components/` (sidebar, navbar, etc.)

## Important Constraints

1. **Session middleware**: `src/lib/session-middleware.ts` protects API routes; auth tokens stored in cookies, not Authorization headers.

2. **Hono runtime**: API routes require `export const runtime = 'nodejs';` in route handlers.

3. **Database**: Currently uses SQLite with Drizzle. No migrations system in place yet—schema changes require manual DB updates.

4. **No test suite**: There are no tests in this repository. Be careful with refactors.

## File Locations

- Env template: `.env.example` — copy to `.env.local`
- Type declarations: `environment.d.ts`
- Tailwind config: `tailwind.config.ts`
- Lint config: `.eslintrc.json` + `.eslintrc.json` (separate)
- Prettier config: `.prettierrc.json` + `.prettierrc.mjs`