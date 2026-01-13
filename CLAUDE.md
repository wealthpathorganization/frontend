# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WealthPath Frontend is a Next.js 14 application for personal finance management. It supports:
- Multi-language (English/Vietnamese) via next-intl
- PWA capabilities with service worker
- JWT authentication with HttpOnly refresh tokens

## Build & Test Commands

```bash
# Development
npm run dev                              # Start dev server at :3000

# Testing
npm test                                 # Run all Jest unit tests
npm test -- path/to/file.test.ts         # Single test file
npm test -- --testPathPattern="api"      # Tests matching pattern
npm run test:watch                       # Watch mode
npm run test:coverage                    # With coverage (80% threshold)

# E2E (Playwright)
npm run test:e2e                         # Headless tests
npm run test:e2e:ui                      # With Playwright UI
npm run test:e2e:headed                  # In visible browser

# Build & Lint
npm run build                            # Production build
npm run lint                             # ESLint

# API Type Generation (after backend changes)
npm run generate:api                     # Generates src/lib/api-types.ts from backend swagger.json
```

## Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Internationalized routes (en, vi)
│   │   ├── (auth)/         # Login/register (no sidebar)
│   │   └── (dashboard)/    # Protected routes (with sidebar)
│   └── (auth|dashboard)/   # Legacy non-locale routes (to be removed)
├── components/
│   └── ui/                 # shadcn/ui components (Radix primitives)
├── store/                  # Zustand stores
├── lib/
│   ├── api.ts              # ApiClient singleton with token refresh
│   ├── api-types.ts        # Generated from backend swagger.json
│   └── utils.ts            # cn() utility for class merging
├── messages/               # i18n JSON files (en.json, vi.json)
├── i18n.ts                 # Locale configuration
└── middleware.ts           # next-intl middleware (locale routing)
```

### Authentication Flow
- **ApiClient** (`lib/api.ts`): Manages in-memory access tokens (not localStorage for XSS protection)
- **useAuthStore** (`store/auth.ts`): Zustand store with persist middleware for user data only
- Refresh tokens are HttpOnly cookies; access tokens refresh automatically on 401

### Key Patterns

**API Client Usage:**
```tsx
import { api } from "@/lib/api"
const transactions = await api.getTransactions({ page: 1 })
```

**i18n in Components:**
```tsx
import { useTranslations, useLocale } from 'next-intl'
const t = useTranslations('dashboard')
const locale = useLocale()
<Link href={`/${locale}/settings`}>{t('settings')}</Link>
```

**Zustand Store Pattern:**
```tsx
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({ /* state and actions */ }),
    { name: "auth-storage", partialize: (state) => ({ /* only persist non-transient state */ }) }
  )
)
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_BASE_URL` | Frontend canonical URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console verification |

## PWA & Delivery

- PWA manifest at `public/manifest.json`
- Service worker at `public/sw.js` (caching + push notifications)
- Download page at `[locale]/download` for APK distribution
- Icon generation script: `../scripts/generate-icons.js`

## Testing Conventions

**Unit Tests (Jest):** Files named `*.test.ts(x)` alongside source files
```bash
npm test -- src/lib/api.test.ts
```

**E2E Tests (Playwright):** In `e2e/` directory, use `@smoke` tag for CI subset
```bash
npm run test:e2e -- --grep "@smoke"      # Only smoke tests
FULL_SUITE=1 npm run test:e2e            # All tests
```

## Component Rules (from .claude/rules/frontend.md)

- Use `React.forwardRef` for components wrapping HTML elements
- Set `displayName` on forwardRef components
- Use `cn()` from `@/lib/utils` for dynamic class composition
- Query keys as arrays: `["transactions", filters]`
- Stale time default: 60 seconds for TanStack Query
