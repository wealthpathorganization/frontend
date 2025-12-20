/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum GithubComWealthpathBackendInternalModelTransactionType {
  TransactionTypeIncome = "income",
  TransactionTypeExpense = "expense",
}

export enum GithubComWealthpathBackendInternalModelRecurringFrequency {
  FrequencyDaily = "daily",
  FrequencyWeekly = "weekly",
  FrequencyBiweekly = "biweekly",
  FrequencyMonthly = "monthly",
  FrequencyYearly = "yearly",
}

export enum GithubComWealthpathBackendInternalModelDebtType {
  DebtTypeMortgage = "mortgage",
  DebtTypeAutoLoan = "auto_loan",
  DebtTypeStudentLoan = "student_loan",
  DebtTypeCreditCard = "credit_card",
  DebtTypePersonalLoan = "personal_loan",
  DebtTypeOther = "other",
}

export interface GithubComWealthpathBackendInternalModelAmortizationRow {
  interest?: number;
  month?: number;
  payment?: number;
  principal?: number;
  remainingBalance?: number;
}

export interface GithubComWealthpathBackendInternalModelBudget {
  amount?: number;
  category?: string;
  createdAt?: string;
  currency?: string;
  endDate?: string;
  id?: string;
  /** monthly, weekly, yearly */
  period?: string;
  startDate?: string;
  updatedAt?: string;
  userId?: string;
}

export interface GithubComWealthpathBackendInternalModelBudgetWithSpent {
  amount?: number;
  category?: string;
  createdAt?: string;
  currency?: string;
  endDate?: string;
  id?: string;
  percentage?: number;
  /** monthly, weekly, yearly */
  period?: string;
  remaining?: number;
  spent?: number;
  startDate?: string;
  updatedAt?: string;
  userId?: string;
}

export interface GithubComWealthpathBackendInternalModelDashboardData {
  budgetSummary?: GithubComWealthpathBackendInternalModelBudgetWithSpent[];
  expensesByCategory?: Record<string, number>;
  incomeVsExpenses?: GithubComWealthpathBackendInternalModelMonthlyComparison[];
  netCashFlow?: number;
  recentTransactions?: GithubComWealthpathBackendInternalModelTransaction[];
  savingsGoals?: GithubComWealthpathBackendInternalModelSavingsGoal[];
  totalDebt?: number;
  totalExpenses?: number;
  totalIncome?: number;
  totalSavings?: number;
}

export interface GithubComWealthpathBackendInternalModelDebt {
  createdAt?: string;
  currency?: string;
  currentBalance?: number;
  /** Day of month */
  dueDay?: number;
  expectedPayoff?: string;
  id?: string;
  /** APR as percentage */
  interestRate?: number;
  minimumPayment?: number;
  name?: string;
  originalAmount?: number;
  startDate?: string;
  type?: GithubComWealthpathBackendInternalModelDebtType;
  updatedAt?: string;
  userId?: string;
}

export interface GithubComWealthpathBackendInternalModelMonthlyComparison {
  expenses?: number;
  income?: number;
  month?: string;
}

export interface GithubComWealthpathBackendInternalModelPayoffPlan {
  amortizationPlan?: GithubComWealthpathBackendInternalModelAmortizationRow[];
  currentBalance?: number;
  debtId?: string;
  monthlyPayment?: number;
  monthsToPayoff?: number;
  payoffDate?: string;
  totalInterest?: number;
  totalPayment?: number;
}

export interface GithubComWealthpathBackendInternalModelRecurringTransaction {
  amount?: number;
  category?: string;
  createdAt?: string;
  currency?: string;
  description?: string;
  endDate?: string;
  frequency?: GithubComWealthpathBackendInternalModelRecurringFrequency;
  id?: string;
  isActive?: boolean;
  lastGenerated?: string;
  nextOccurrence?: string;
  startDate?: string;
  type?: GithubComWealthpathBackendInternalModelTransactionType;
  updatedAt?: string;
  userId?: string;
}

export interface GithubComWealthpathBackendInternalModelSavingsGoal {
  color?: string;
  createdAt?: string;
  currency?: string;
  currentAmount?: number;
  icon?: string;
  id?: string;
  name?: string;
  targetAmount?: number;
  targetDate?: string;
  updatedAt?: string;
  userId?: string;
}

export interface GithubComWealthpathBackendInternalModelTransaction {
  amount?: number;
  category?: string;
  createdAt?: string;
  currency?: string;
  date?: string;
  description?: string;
  id?: string;
  type?: GithubComWealthpathBackendInternalModelTransactionType;
  updatedAt?: string;
  userId?: string;
}

export interface GithubComWealthpathBackendInternalModelUser {
  avatarUrl?: string;
  createdAt?: string;
  currency?: string;
  email?: string;
  id?: string;
  name?: string;
  oauthProvider?: string;
  updatedAt?: string;
}

export interface GithubComWealthpathBackendInternalServiceAuthResponse {
  token?: string;
  user?: GithubComWealthpathBackendInternalModelUser;
}

export interface GithubComWealthpathBackendInternalServiceContributeInput {
  amount?: number;
}

export interface GithubComWealthpathBackendInternalServiceCreateBudgetInput {
  amount?: number;
  category?: string;
  currency?: string;
  endDate?: string;
  /** monthly, weekly, yearly */
  period?: string;
  startDate?: string;
}

export interface GithubComWealthpathBackendInternalServiceCreateDebtInput {
  currency?: string;
  currentBalance?: number;
  dueDay?: number;
  /** APR as percentage (e.g., 5.5 for 5.5%) */
  interestRate?: number;
  minimumPayment?: number;
  name?: string;
  originalAmount?: number;
  startDate?: string;
  type?: GithubComWealthpathBackendInternalModelDebtType;
}

export interface GithubComWealthpathBackendInternalServiceCreateRecurringInput {
  amount?: number;
  category?: string;
  currency?: string;
  description?: string;
  endDate?: string;
  frequency?: GithubComWealthpathBackendInternalModelRecurringFrequency;
  startDate?: string;
  type?: GithubComWealthpathBackendInternalModelTransactionType;
}

export interface GithubComWealthpathBackendInternalServiceCreateSavingsGoalInput {
  color?: string;
  currency?: string;
  icon?: string;
  name?: string;
  targetAmount?: number;
  targetDate?: string;
}

export interface GithubComWealthpathBackendInternalServiceCreateTransactionInput {
  amount?: number;
  category?: string;
  currency?: string;
  date?: string;
  description?: string;
  type?: GithubComWealthpathBackendInternalModelTransactionType;
}

export interface GithubComWealthpathBackendInternalServiceInterestCalculatorResult {
  monthlyPayment?: number;
  payoffDate?: string;
  totalInterest?: number;
  totalPayment?: number;
}

export interface GithubComWealthpathBackendInternalServiceLoginInput {
  email?: string;
  password?: string;
}

export interface GithubComWealthpathBackendInternalServiceMakePaymentInput {
  amount?: number;
  date?: string;
}

export interface GithubComWealthpathBackendInternalServiceRegisterInput {
  currency?: string;
  email?: string;
  name?: string;
  password?: string;
}

export interface GithubComWealthpathBackendInternalServiceUpdateBudgetInput {
  amount?: number;
  category?: string;
  currency?: string;
  endDate?: string;
  period?: string;
  startDate?: string;
}

export interface GithubComWealthpathBackendInternalServiceUpdateDebtInput {
  currency?: string;
  currentBalance?: number;
  dueDay?: number;
  interestRate?: number;
  minimumPayment?: number;
  name?: string;
  originalAmount?: number;
  startDate?: string;
  type?: GithubComWealthpathBackendInternalModelDebtType;
}

export interface GithubComWealthpathBackendInternalServiceUpdateRecurringInput {
  amount?: number;
  category?: string;
  currency?: string;
  description?: string;
  endDate?: string;
  frequency?: GithubComWealthpathBackendInternalModelRecurringFrequency;
  isActive?: boolean;
  startDate?: string;
  type?: GithubComWealthpathBackendInternalModelTransactionType;
}

export interface GithubComWealthpathBackendInternalServiceUpdateSavingsGoalInput {
  color?: string;
  currency?: string;
  currentAmount?: number;
  icon?: string;
  name?: string;
  targetAmount?: number;
  targetDate?: string;
}

export interface GithubComWealthpathBackendInternalServiceUpdateSettingsInput {
  currency?: string;
  name?: string;
}

export interface GithubComWealthpathBackendInternalServiceUpdateTransactionInput {
  amount?: number;
  category?: string;
  currency?: string;
  date?: string;
  description?: string;
  type?: GithubComWealthpathBackendInternalModelTransactionType;
}

export interface InternalHandlerErrorResponse {
  error?: string;
  field?: string;
}
