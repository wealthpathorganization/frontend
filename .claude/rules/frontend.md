# Frontend (Next.js) Best Practices

## Component Structure

### File Naming
- **Files:** Use kebab-case: `currency-input.tsx`, `empty-state.tsx`
- **Components:** PascalCase: `CurrencyInput`, `EmptyState`
- **Hooks:** camelCase with `use` prefix: `useCurrency`, `useToast`
- **Handlers:** `handle` prefix: `handleSubmit`, `handleChange`

### ForwardRef Components
Always use `React.forwardRef` for components wrapping HTML elements. Set `displayName` for debugging.

```tsx
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Implementation
  }
)
CurrencyInput.displayName = "CurrencyInput"
```

### Component File Structure
Organize component files consistently:

```tsx
// 1. Imports (external, then internal, then types)
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ButtonProps } from './types'

// 2. Types/Interfaces (if not in separate file)
interface Props extends ButtonProps {
  isLoading?: boolean
}

// 3. Component definition
export function Button({ className, isLoading, children, ...props }: Props) {
  // hooks first
  const [isHovered, setIsHovered] = useState(false)

  // derived state
  const isDisabled = props.disabled || isLoading

  // handlers
  const handleClick = () => { /* ... */ }

  // render
  return (
    <button className={cn('...', className)} {...props}>
      {children}
    </button>
  )
}
```

## State Management (Zustand)

### Store Pattern
One store per feature domain with clear separation of state and actions.

```tsx
interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean  // Don't persist transient state

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.login({ email, password })
          set({ user: response.user, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        await api.logout()
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Exclude isLoading from persistence
      }),
    }
  )
)
```

### Store Selectors
Use selectors to prevent unnecessary re-renders:

```tsx
// Bad - subscribes to entire store
const { user, isLoading } = useAuthStore()

// Good - subscribes only to needed state
const user = useAuthStore((state) => state.user)
const isLoading = useAuthStore((state) => state.isLoading)
```

## API Integration (TanStack Query)

### Query Key Factory
Use a factory pattern for consistent cache management:

```tsx
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}
```

### Query Hooks
Wrap TanStack Query hooks for type safety and consistency:

```tsx
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters || {}),
    queryFn: () => api.getTransactions(filters),
    staleTime: 60 * 1000, // 60 seconds default
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionInput) => api.createTransaction(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
  })
}
```

### Optimistic Updates
For better UX, use optimistic updates for mutations:

```tsx
useMutation({
  mutationFn: updateTransaction,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: transactionKeys.detail(id) })
    const previous = queryClient.getQueryData(transactionKeys.detail(id))
    queryClient.setQueryData(transactionKeys.detail(id), newData)
    return { previous }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(transactionKeys.detail(id), context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) })
  },
})
```

## Styling (TailwindCSS)

### cn() Utility
Always use `cn()` from `@/lib/utils` for dynamic class composition:

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // Allow override from props
)} />
```

### CVA Variants
Use Class Variance Authority for component variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}
```

### Theme Variables
Use HSL-based CSS variables for theming. Colors are defined in `globals.css`:

```css
/* Light theme */
--primary: 262 83% 58%;           /* HSL values without hsl() */
--primary-foreground: 0 0% 100%;

/* Usage in Tailwind */
bg-primary        /* Uses hsl(var(--primary)) */
text-primary-foreground
```

## Loading & Error States

### Skeleton Loading
Use animated placeholders during data fetching:

```tsx
function TransactionListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
          </div>
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
```

### Error State Pattern

```tsx
function TransactionList() {
  const { data, isLoading, error, refetch } = useTransactions()

  if (isLoading) return <TransactionListSkeleton />

  if (error) {
    return (
      <ErrorState
        title="Failed to load transactions"
        description={error.message}
        onRetry={refetch}
      />
    )
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add your first transaction to get started"
        actionLabel="Add Transaction"
        onAction={() => router.push('/transactions/new')}
      />
    )
  }

  return <TransactionListContent data={data} />
}
```

## Internationalization (next-intl)

### Locale in URLs
Always include locale prefix in routes: `/${locale}/dashboard`

### Translation Hooks

```tsx
import { useTranslations, useLocale } from 'next-intl'

function DashboardHeader() {
  const t = useTranslations('dashboard')
  const locale = useLocale()

  return (
    <header>
      <h1>{t('title')}</h1>
      <Link href={`/${locale}/settings`}>{t('settings')}</Link>
    </header>
  )
}
```

### Message File Structure
Organize by feature in `/messages/{locale}.json`:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcomeBack": "Welcome back, {name}"
  },
  "transactions": {
    "title": "Transactions",
    "addNew": "Add Transaction"
  }
}
```

### Server Components
For server components, use `getTranslations`:

```tsx
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')
  return <h1>{t('title')}</h1>
}
```

## Testing

### Jest Unit Tests
Place tests alongside source files with `.test.ts(x)` suffix:

```tsx
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', () => {
    render(<Button isLoading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Mocking API Calls

```tsx
import { api } from '@/lib/api'

jest.mock('@/lib/api')

describe('useTransactions', () => {
  it('fetches transactions successfully', async () => {
    const mockData = [{ id: '1', amount: '100' }]
    ;(api.getTransactions as jest.Mock).mockResolvedValue(mockData)

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData)
    })
  })
})
```

### Playwright E2E
E2E tests in `/e2e` directory, use `@smoke` tag for CI subset:

```tsx
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully @smoke', async ({ page }) => {
    await page.goto('/en/login')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/dashboard/)
    await expect(page.getByText(/welcome back/i)).toBeVisible()
  })
})
```

## Form Handling

### React Hook Form Integration

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
})

type TransactionFormData = z.infer<typeof transactionSchema>

function TransactionForm({ onSubmit }: { onSubmit: (data: TransactionFormData) => void }) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields... */}
      </form>
    </Form>
  )
}
```

## Naming Conventions Summary

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `currency-input.tsx` |
| Components | PascalCase | `CurrencyInput` |
| Hooks | camelCase with `use` prefix | `useCurrency`, `useToast` |
| Handlers | `handle` prefix | `handleSubmit`, `handleChange` |
| Query Keys | Arrays with factory | `["transactions", "list", filters]` |
| Store Names | `use` + Domain + `Store` | `useAuthStore`, `useSettingsStore` |
| Types/Interfaces | PascalCase | `TransactionFormData` |
| Constants | UPPER_SNAKE_CASE | `EXPENSE_CATEGORIES` |
