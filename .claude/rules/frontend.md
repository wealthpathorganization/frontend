# Frontend (Next.js) Best Practices

## Component Structure

- **File Naming:** Use kebab-case for files: `currency-input.tsx`, `empty-state.tsx`
- **ForwardRef:** Always use `React.forwardRef` for components wrapping HTML elements
- **DisplayName:** Set `displayName` on forwardRef components for debugging

```tsx
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Implementation
  }
)
CurrencyInput.displayName = "CurrencyInput"
```

## State Management (Zustand)

- **Single Domain Stores:** One store per feature domain (`auth.ts`, `settings.ts`)
- **Persist Middleware:** Use for client-side state persistence
- **Partialize:** Only persist non-transient state (exclude `isLoading`)

```tsx
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,  // Don't persist this
      login: async (email, password) => { /* ... */ },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)
```

## API Integration (TanStack Query)

- **Query Keys as Arrays:** Use descriptive array keys for cache management
- **Stale Time:** Default to 60 seconds for most queries
- **Centralized API Client:** Use the `api` singleton from `lib/api.ts`

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["transactions", filters],
  queryFn: () => api.getTransactions(filters),
  staleTime: 60 * 1000,
})
```

## Styling (TailwindCSS)

- **cn() Utility:** Always use `cn()` for dynamic class composition
- **CVA Variants:** Use Class Variance Authority for component variants
- **CSS Variables:** Use HSL-based theme variables for colors

```tsx
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

## Error & Loading States

- **Skeleton Loading:** Use animated placeholders during data fetching
- **Error Boundaries:** Implement fallback UI for error states
- **Toast Notifications:** Use `useToast()` for user feedback

```tsx
if (isLoading) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-32 bg-muted rounded-xl" />
    </div>
  )
}

if (error) {
  return <ErrorState title="Failed to load" onRetry={refetch} />
}
```

## Internationalization (next-intl)

- **Locale in URLs:** Always include locale prefix: `/${locale}/dashboard`
- **useTranslations Hook:** Access translations in client components
- **Message Files:** Organize by feature in `/messages/{locale}.json`

```tsx
const t = useTranslations('dashboard')
const locale = useLocale()

<Link href={`/${locale}/settings`}>{t('settings')}</Link>
```

## Testing

- **Jest for Units:** Test components, hooks, and utilities
- **Playwright for E2E:** Test user flows with real browser
- **Mock External Dependencies:** Always mock `api` and external services

```tsx
// Jest unit test
describe('Button', () => {
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

// Playwright E2E
test('should login successfully', async ({ page }) => {
  await page.goto('/en/login')
  await page.getByLabel(/email/i).fill('test@example.com')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/dashboard/)
})
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `currency-input.tsx` |
| Components | PascalCase | `CurrencyInput` |
| Hooks | camelCase with `use` prefix | `useCurrency`, `useToast` |
| Handlers | `handle` prefix | `handleSubmit`, `handleChange` |
| Query Keys | Arrays | `["transactions", userId]` |
