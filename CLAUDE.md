# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Start** — Multi-tenant HR and recruitment SaaS platform. Manages job vacancies, candidates, employees, tests (DISC), feedback, and admin operations. Multi-role architecture with distinct modules per user type.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT stored in HTTP-only cookies
- **Styling**: Tailwind CSS 4, Radix UI, Lucide React icons, shadcn/ui components
- **Scripts**: Node.js migration scripts

## Commands

```bash
npm run dev       # Start development server on port 3000
npm run build     # Build for production
npm start         # Run production server
npm run lint      # Run ESLint
npm run migrate   # Run database migrations (node scripts/migrate-status-vaga.js)
```

## Architecture

### Multi-Tenant, Role-Based System

The platform is divided into modules by user role and functionality:

- **Admin Area** (`/admin`) — Platform admins manage global companies, users, system settings
- **Empresa** (`/empresa`) — Company staff post jobs, screen candidates, manage employees
- **Candidato** (`/candidato`) — Job seekers search, apply, track applications
- **Gestor** (`/gestor`) — Managers approve, track teams
- **Vagas Public** (`/vagas`) — Public job board (conversion-optimized, no auth required)
- **Auth** (`/auth`) — Login, register, password reset

Each module has:
- A layout file (`layout.tsx`) — Server component
- A layout-client file (`layout-client.tsx`) — Client component wrapper for client-only features
- Protected pages that check `getServerUser()` and redirect unauthorized access

### File Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin module
│   ├── empresa/             # Company module
│   ├── candidato/           # Candidate module
│   ├── gestor/              # Manager module
│   ├── vagas/               # Public job board
│   ├── auth/                # Auth flows
│   ├── api/                 # Backend API routes
│   │   ├── auth/            # Auth endpoints
│   │   ├── admin/           # Admin-only endpoints
│   │   └── ...
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Root redirect logic
├── lib/
│   ├── auth/                # Authentication (JWT, session, api-helpers)
│   ├── db/                  # Database (pool, query-executor)
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts           # Client auth state, user data
│   ├── useCompanyAdmin.ts   # Company admin operations
│   └── useTheme.ts
├── components/
│   ├── admin/               # Admin-specific components
│   └── ...                  # Shared UI components
└── types/
    └── database.ts          # All database types and interfaces
```

### Database Schema

Core entities: `users`, `empresas`, `vagas`, `candidatos`, `colaboradores`, `respostas_testes`, `feedbacks`, `agendamentos`, `questoes_disc`, `template_testes`

Database types are defined in `src/types/database.ts`. Use these types across the codebase — they're authoritative.

Common fields in most tables:
- `id` (UUID primary key)
- `empresa_id` (foreign key, null for platform-level records)
- `created_at` / `updated_at` timestamps

### Authentication Flow

1. **Login/Register** — User submits email/password → API validates → `signToken()` creates JWT → stored in HTTP-only cookie
2. **Server Verification** — `getServerUser()` reads cookie, verifies JWT, fetches full user profile from DB
3. **Session Check** — All protected pages call `getServerUser()` before rendering; redirects unauthorized users
4. **Client State** — `useAuth()` hook reads user from server state or makes a lightweight API call on page load

JWT payload contains: `userId`, `email`, `role`. 

Rate limiting is applied to sensitive endpoints (login: 5 attempts per 15 min).

### API Route Conventions

Routes are in `src/app/api/**` as `route.ts` files. Pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  const body = await request.json()
  // Process and respond
  return NextResponse.json({ success: true })
}
```

All API routes should verify auth and check role/permissions upfront.

### Database Access

- **Pool**: `src/lib/db/pool.ts` exports `pool` — raw pg.Pool instance, use for manual queries
- **Helpers**: `src/lib/auth/api-helpers.ts` contains wrapped query functions (e.g., `queryWithAuth`)
- **Queries**: Always use parameterized queries (`$1`, `$2`) to prevent SQL injection

Example:
```typescript
import pool from '@/lib/db/pool'

const { rows } = await pool.query(
  'SELECT * FROM users WHERE id = $1 AND ativo = true',
  [userId],
)
```

### Client Components & Hooks

- **useAuth()** — Returns current user or null. Use in client components to read authenticated state.
- **useCompanyAdmin()** — Helpers for company staff operations (fetch companies, users, etc).
- **useTheme()** — Read/set theme preference from database.

## Key Patterns

**SSR Pages**: Server components by default. Fetch user with `getServerUser()`, handle not-found/unauthorized at the top. Only wrap client-only features (forms, modals, state) in a layout-client component.

**Form Handling**: Client forms POST to `/api/...` routes. Validate inputs client-side with TypeScript and server-side in the API.

**Permissions**: Roles are defined in types/database.ts. Admin/gestor endpoints check `user.role` in the route handler.

**Types**: Import from `src/types/database.ts`, not inline. Keep schemas single-source-of-truth.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for signing JWTs
- `SETUP_SECRET` — Secret for initial admin setup endpoint

## Notes

- Tailwind and PostCSS are configured (package.json shows @tailwindcss/postcss and tailwindcss v4).
- Eslint is configured (eslint.config.mjs). Run `npm run lint` before committing.
- Never commit
- The project is ~60% MVP as of 2026-04-20. See README.md for module feature status.
