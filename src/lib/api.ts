const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("token")
    }
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null
    if (!this.token) {
      this.token = localStorage.getItem("token")
    }
    return this.token
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...init } = options
    
    let url = `${API_BASE}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const token = this.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, { ...init, headers })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }))
      throw new Error(error.error || "Request failed")
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  // Auth
  async register(data: { email: string; password: string; name: string; currency?: string }) {
    return this.request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async loginWithTOTP(data: { tempToken: string; code: string }) {
    return this.request<AuthResponse>("/api/auth/login/2fa", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async loginWithBackupCode(data: { tempToken: string; backupCode: string }) {
    return this.request<AuthResponse>("/api/auth/login/2fa/backup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getMe() {
    return this.request<User>("/api/auth/me")
  }

  async updateSettings(data: UpdateSettingsInput) {
    return this.request<User>("/api/auth/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // 2FA Management
  async setup2FA() {
    return this.request<TOTPSetupResponse>("/api/auth/2fa/setup", {
      method: "POST",
    })
  }

  async verify2FA(code: string) {
    return this.request<TOTPVerifyResponse>("/api/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  }

  async disable2FA(code: string) {
    return this.request<{ message: string }>("/api/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  }

  async regenerateBackupCodes(code: string) {
    return this.request<TOTPVerifyResponse>("/api/auth/2fa/backup-codes", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  }

  // Dashboard
  async getDashboard() {
    return this.request<DashboardData>("/api/dashboard")
  }

  async getMonthlyDashboard(year: number, month: number) {
    return this.request<DashboardData>(`/api/dashboard/monthly/${year}/${month}`)
  }

  // Transactions
  async getTransactions(params?: TransactionFilters) {
    return this.request<Transaction[]>("/api/transactions", { params: params as Record<string, string> })
  }

  async createTransaction(data: CreateTransactionInput) {
    return this.request<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTransaction(id: string, data: CreateTransactionInput) {
    return this.request<Transaction>(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTransaction(id: string) {
    return this.request(`/api/transactions/${id}`, { method: "DELETE" })
  }

  // Budgets
  async getBudgets() {
    return this.request<BudgetWithSpent[]>("/api/budgets")
  }

  async createBudget(data: CreateBudgetInput) {
    return this.request<Budget>("/api/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateBudget(id: string, data: CreateBudgetInput) {
    return this.request<Budget>(`/api/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteBudget(id: string) {
    return this.request(`/api/budgets/${id}`, { method: "DELETE" })
  }

  // Savings Goals
  async getSavingsGoals() {
    return this.request<SavingsGoalWithProjection[]>("/api/savings-goals")
  }

  async createSavingsGoal(data: CreateSavingsGoalInput) {
    return this.request<SavingsGoal>("/api/savings-goals", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateSavingsGoal(id: string, data: CreateSavingsGoalInput) {
    return this.request<SavingsGoal>(`/api/savings-goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteSavingsGoal(id: string) {
    return this.request(`/api/savings-goals/${id}`, { method: "DELETE" })
  }

  async contributeSavingsGoal(id: string, amount: number) {
    return this.request<SavingsGoal>(`/api/savings-goals/${id}/contribute`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
  }

  // Debts
  async getDebts() {
    return this.request<Debt[]>("/api/debts")
  }

  async getDebtSummary() {
    return this.request<DebtSummary>("/api/debts/summary")
  }

  async createDebt(data: CreateDebtInput) {
    return this.request<Debt>("/api/debts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateDebt(id: string, data: CreateDebtInput) {
    return this.request<Debt>(`/api/debts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteDebt(id: string) {
    return this.request(`/api/debts/${id}`, { method: "DELETE" })
  }

  async makeDebtPayment(id: string, amount: number, date: string) {
    return this.request<Debt>(`/api/debts/${id}/payment`, {
      method: "POST",
      body: JSON.stringify({ amount, date }),
    })
  }

  async getPayoffPlan(id: string, monthlyPayment?: number) {
    const params: Record<string, string> = {}
    if (monthlyPayment) params.monthlyPayment = monthlyPayment.toString()
    return this.request<PayoffPlan>(`/api/debts/${id}/payoff-plan`, { params })
  }

  async calculateInterest(params: InterestCalculatorInput) {
    return this.request<InterestCalculatorResult>("/api/debts/calculator", {
      params: params as unknown as Record<string, string>,
    })
  }

  // AI Chat
  async chat(message: string) {
    return this.request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    })
  }

  // Recurring Transactions
  async getRecurringTransactions() {
    return this.request<RecurringTransaction[]>("/api/recurring")
  }

  async createRecurringTransaction(data: CreateRecurringInput) {
    return this.request<RecurringTransaction>("/api/recurring", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateRecurringTransaction(id: string, data: UpdateRecurringInput) {
    return this.request<RecurringTransaction>(`/api/recurring/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteRecurringTransaction(id: string) {
    return this.request(`/api/recurring/${id}`, { method: "DELETE" })
  }

  async pauseRecurringTransaction(id: string) {
    return this.request<RecurringTransaction>(`/api/recurring/${id}/pause`, {
      method: "POST",
    })
  }

  async resumeRecurringTransaction(id: string) {
    return this.request<RecurringTransaction>(`/api/recurring/${id}/resume`, {
      method: "POST",
    })
  }

  async getUpcomingBills() {
    return this.request<UpcomingBill[]>("/api/recurring/upcoming")
  }

  // Interest Rates
  async getInterestRates(params?: { type?: string; term?: string; bank?: string }) {
    return this.request<InterestRate[]>("/api/interest-rates", { params: params as Record<string, string> })
  }

  async getBestRates(params: { type?: string; term: string; limit?: string }) {
    return this.request<InterestRate[]>("/api/interest-rates/best", { params: params as Record<string, string> })
  }

  async compareRates(params: { type?: string; term: string }) {
    return this.request<InterestRate[]>("/api/interest-rates/compare", { params: params as Record<string, string> })
  }

  async getBanks() {
    return this.request<Bank[]>("/api/interest-rates/banks")
  }

  async getRateHistory(params: { bank: string; type?: string; term: string; days?: string }) {
    return this.request<RateHistoryEntry[]>("/api/interest-rates/history", { params: params as Record<string, string> })
  }

  async seedRates() {
    return this.request<{ message: string }>("/api/interest-rates/seed", { method: "POST" })
  }

  async scrapeRates() {
    return this.request<{ message: string; count: number }>("/api/interest-rates/scrape", { method: "POST" })
  }

  // Reports
  async getMonthlyReport(year: number, month: number) {
    return this.request<MonthlyReport>("/api/reports/monthly", {
      params: { year: year.toString(), month: month.toString() },
    })
  }

  async getCategoryTrends(months?: number, limit?: number) {
    const params: Record<string, string> = {}
    if (months) params.months = months.toString()
    if (limit) params.limit = limit.toString()
    return this.request<CategoryTrendsResponse>("/api/reports/category-trends", { params })
  }

  // Export
  async exportTransactionsCSV(filters?: TransactionFilters) {
    const params: Record<string, string> = {}
    if (filters) {
      if (filters.type) params.type = filters.type
      if (filters.category) params.category = filters.category
      if (filters.categories) params.categories = filters.categories
      if (filters.search) params.search = filters.search
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
    }
    const queryString = new URLSearchParams(params).toString()
    const url = `${API_BASE}/api/transactions/export/csv${queryString ? `?${queryString}` : ""}`

    const headers: Record<string, string> = {}
    const token = this.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error("Failed to export transactions")
    }

    const blob = await response.blob()
    const filename = response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || "transactions.csv"
    return { blob, filename }
  }

  async exportMonthlyReportPDF(year: number, month: number) {
    const url = `${API_BASE}/api/reports/monthly/${year}/${month}/export/pdf`

    const headers: Record<string, string> = {}
    const token = this.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error("Failed to export report")
    }

    const blob = await response.blob()
    const filename = response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || `report_${year}_${month}.pdf`
    return { blob, filename }
  }

  // Calendar
  async getRecurringCalendar(year: number, month: number) {
    return this.request<CalendarResponse>("/api/recurring/calendar", {
      params: { year: year.toString(), month: month.toString() },
    })
  }

  // Push Notifications
  async subscribeToPush(data: { endpoint: string; p256dh: string; auth: string; userAgent?: string }) {
    return this.request<PushSubscription>("/api/notifications/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async unsubscribeFromPush(data: { endpoint: string }) {
    return this.request("/api/notifications/unsubscribe", {
      method: "DELETE",
      body: JSON.stringify(data),
    })
  }

  async getNotificationPreferences() {
    return this.request<NotificationPreferences>("/api/notifications/preferences")
  }

  async updateNotificationPreferences(data: UpdateNotificationPreferencesInput) {
    return this.request<NotificationPreferences>("/api/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()

// Chat Types
export interface ChatResponse {
  message: string
  action?: {
    type: "transaction" | "budget" | "savings_goal"
    data: Transaction | Budget | SavingsGoal
  }
}

// Types
export interface User {
  id: string
  email: string
  name: string
  currency: string
  totpEnabled: boolean
  createdAt: string
}

// Auth Response with optional 2FA fields
export interface AuthResponse {
  token?: string
  user?: User
  requiresTOTP?: boolean
  tempToken?: string
}

// 2FA Types
export interface TOTPSetupResponse {
  secret: string
  qrCodeUrl: string
  manualEntry: string
}

export interface TOTPVerifyResponse {
  backupCodes: string[]
}

export interface UpdateSettingsInput {
  name?: string
  currency?: string
}

export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "KRW", name: "Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
] as const

export interface Transaction {
  id: string
  userId: string
  type: "income" | "expense"
  amount: string
  currency: string
  category: string
  description: string
  date: string
  createdAt: string
}

export interface TransactionFilters {
  type?: string
  category?: string
  categories?: string      // Comma-separated list of categories
  search?: string          // Text search in description
  minAmount?: string       // Minimum amount filter
  maxAmount?: string       // Maximum amount filter
  datePreset?: string      // Preset: last7days, last30days, thisMonth, lastMonth
  startDate?: string
  endDate?: string
  page?: string
  pageSize?: string
}

export type DatePreset = "last7days" | "last30days" | "thisMonth" | "lastMonth" | "custom"

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "custom", label: "Custom range" },
]

export interface CreateTransactionInput {
  type: "income" | "expense"
  amount: number
  currency?: string
  category: string
  description?: string
  date: string
}

export interface Budget {
  id: string
  userId: string
  category: string
  amount: string
  currency: string
  period: string
  startDate: string
  endDate?: string
  enableRollover: boolean
  maxRolloverAmount?: string
  rolloverAmount: string
}

export interface BudgetWithSpent extends Budget {
  spent: string
  remaining: string
  percentage: number
}

export interface CreateBudgetInput {
  category: string
  amount: number
  currency?: string
  period?: string
  startDate: string
  endDate?: string
  enableRollover?: boolean
  maxRolloverAmount?: number
}

export interface SavingsGoal {
  id: string
  userId: string
  name: string
  targetAmount: string
  currentAmount: string
  currency: string
  targetDate?: string
  color: string
  icon: string
  createdAt: string
}

export interface SavingsGoalWithProjection extends SavingsGoal {
  monthlyContributionRate: string
  estimatedCompletionDate?: string
  monthsToCompletion?: number
  isOnTrack?: boolean
}

export interface CreateSavingsGoalInput {
  name: string
  targetAmount: number
  currency?: string
  targetDate?: string
  color?: string
  icon?: string
}

export interface Debt {
  id: string
  userId: string
  name: string
  type: string
  originalAmount: string
  currentBalance: string
  interestRate: string
  minimumPayment: string
  currency: string
  dueDay: number
  startDate: string
  expectedPayoff?: string
}

export interface CreateDebtInput {
  name: string
  type: string
  originalAmount: number
  currentBalance?: number
  interestRate: number
  minimumPayment: number
  currency?: string
  dueDay: number
  startDate: string
}

export interface PayoffPlan {
  debtId: string
  currentBalance: string
  monthlyPayment: string
  totalInterest: string
  totalPayment: string
  payoffDate: string
  monthsToPayoff: number
  amortizationPlan: AmortizationRow[]
}

export interface AmortizationRow {
  month: number
  payment: string
  principal: string
  interest: string
  remainingBalance: string
}

export interface InterestCalculatorInput {
  principal: number
  interestRate: number
  termMonths: number
  paymentType?: string
}

export interface InterestCalculatorResult {
  monthlyPayment: string
  totalPayment: string
  totalInterest: string
  payoffDate: string
}

export interface DebtSummary {
  totalDebt: string
  debtCount: number
  debtFreeDate?: string
  monthsToDebtFree?: number
  totalInterestCost: string
  debtsByPayoff: DebtPayoffSummary[]
}

export interface DebtPayoffSummary {
  id: string
  name: string
  type: string
  currentBalance: string
  interestRate: string
  minimumPayment: string
  payoffDate: string
  monthsToPayoff: number
  totalInterest: string
}

export interface DashboardData {
  totalIncome: string
  totalExpenses: string
  netCashFlow: string
  totalSavings: string
  totalDebt: string
  budgetSummary: BudgetWithSpent[]
  savingsGoals: SavingsGoal[]
  recentTransactions: Transaction[]
  expensesByCategory: Record<string, string>
  incomeVsExpenses: MonthlyComparison[]
}

export interface MonthlyComparison {
  month: string
  income: string
  expenses: string
}

// Recurring Transactions
export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly"

export interface RecurringTransaction {
  id: string
  userId: string
  type: "income" | "expense"
  amount: string
  currency: string
  category: string
  description: string
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
  nextOccurrence: string
  lastGenerated?: string
  isActive: boolean
  createdAt: string
}

export interface CreateRecurringInput {
  type: "income" | "expense"
  amount: number
  currency?: string
  category: string
  description?: string
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
}

export interface UpdateRecurringInput {
  type?: "income" | "expense"
  amount?: number
  currency?: string
  category?: string
  description?: string
  frequency?: RecurringFrequency
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export interface UpcomingBill {
  id: string
  description: string
  amount: string
  currency: string
  category: string
  dueDate: string
  type: "income" | "expense"
}

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const

// Interest Rate Types
export interface InterestRate {
  id: number
  bankCode: string
  bankName: string
  bankLogo?: string
  productType: string
  termMonths: number
  termLabel: string
  rate: string
  minAmount?: string
  maxAmount?: string
  currency: string
  effectiveDate: string
  scrapedAt: string
}

export interface Bank {
  code: string
  name: string
  nameVi: string
  logo: string
  website: string
}

export interface RateHistoryEntry {
  bankCode: string
  productType: string
  termMonths: number
  rate: string
  recordedDate: string
}

// Monthly Report Types
export interface MonthlyReport {
  year: number
  month: number
  currency: string
  totalIncome: string
  totalExpenses: string
  netSavings: string
  savingsRate: number
  topCategories: TopCategory[]
  anomalies: Anomaly[]
  comparedToLast: MonthComparison
  generatedAt: string
}

export interface TopCategory {
  category: string
  amount: string
  percentage: number
  transactionCount: number
}

export interface Anomaly {
  type: "unusual_expense" | "unusual_income" | "missed_income" | "budget_exceeded"
  category: string
  amount: string
  description: string
  severity: "info" | "warning" | "critical"
}

export interface MonthComparison {
  incomeChange: number
  expenseChange: number
  savingsChange: number
  trend: "improving" | "stable" | "declining"
}

// Category Trends Types
export interface CategoryTrendsResponse {
  currency: string
  periodStart: string
  periodEnd: string
  trends: CategoryTrend[]
  generatedAt: string
}

export interface CategoryTrend {
  category: string
  totalAmount: string
  averageAmount: string
  trendDirection: "increasing" | "decreasing" | "stable"
  trendPercentage: number
  monthlyData: MonthlyAmount[]
}

export interface MonthlyAmount {
  month: string
  amount: string
}

// Calendar Types
export interface CalendarResponse {
  year: number
  month: number
  currency: string
  bills: CalendarBill[]
  summary: CalendarSummary
  generatedAt: string
}

export interface CalendarBill {
  id: string
  name: string
  amount: string
  category: string
  dueDate: string
  frequency: RecurringFrequency
  isActive: boolean
  type: "income" | "expense"
}

export interface CalendarSummary {
  totalIncome: string
  totalExpenses: string
  netCashFlow: string
  billCount: number
  incomeCount: number
  expenseCount: number
}

// Push Notification Types
export interface PushSubscription {
  id: string
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationPreferences {
  id: string
  userId: string
  billRemindersEnabled: boolean
  billReminderDaysBefore: number
  budgetAlertsEnabled: boolean
  budgetAlertThreshold: number
  goalMilestonesEnabled: boolean
  weeklySummaryEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateNotificationPreferencesInput {
  billRemindersEnabled?: boolean
  billReminderDaysBefore?: number
  budgetAlertsEnabled?: boolean
  budgetAlertThreshold?: number
  goalMilestonesEnabled?: boolean
  weeklySummaryEnabled?: boolean
}

