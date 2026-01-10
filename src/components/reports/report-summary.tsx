"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Minus,
} from "lucide-react"
import type { MonthlyReport } from "@/lib/api"

interface ReportSummaryProps {
  report: MonthlyReport
  formatCurrency: (amount: string | number) => string
}

interface StatCardProps {
  label: string
  value: string
  change?: number
  icon: React.ReactNode
  colorClass: string
  bgClass: string
  testId: string
}

function TrendBadge({
  change,
  inverse = false,
}: {
  change?: number
  inverse?: boolean
}) {
  if (change === undefined) return null

  const isPositive = inverse ? change < 0 : change >= 0
  const colorClass = isPositive ? "text-success" : "text-destructive"
  const Icon =
    change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus

  return (
    <div
      data-testid="trend-badge"
      className={cn("flex items-center gap-1 text-xs font-medium", colorClass)}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(change).toFixed(1)}%
    </div>
  )
}

function StatCard({
  label,
  value,
  change,
  icon,
  colorClass,
  bgClass,
  testId,
}: StatCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-bold", colorClass)}>{value}</p>
            <TrendBadge
              change={change}
              inverse={testId === "stat-expenses"}
            />
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              bgClass
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportSummary({ report, formatCurrency }: ReportSummaryProps) {
  const netSavings = parseFloat(report.netSavings)
  const isPositiveSavings = netSavings >= 0

  return (
    <div
      data-testid="report-summary"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <StatCard
        testId="stat-income"
        label="Total Income"
        value={formatCurrency(report.totalIncome)}
        change={report.comparedToLast?.incomeChange}
        icon={<TrendingUp className="w-6 h-6 text-success" />}
        colorClass="text-success"
        bgClass="bg-success/10"
      />

      <StatCard
        testId="stat-expenses"
        label="Total Expenses"
        value={formatCurrency(report.totalExpenses)}
        change={report.comparedToLast?.expenseChange}
        icon={<TrendingDown className="w-6 h-6 text-destructive" />}
        colorClass="text-destructive"
        bgClass="bg-destructive/10"
      />

      <StatCard
        testId="stat-savings"
        label="Net Savings"
        value={formatCurrency(report.netSavings)}
        change={report.comparedToLast?.savingsChange}
        icon={
          <Wallet
            className={cn(
              "w-6 h-6",
              isPositiveSavings ? "text-success" : "text-destructive"
            )}
          />
        }
        colorClass={isPositiveSavings ? "text-success" : "text-destructive"}
        bgClass={isPositiveSavings ? "bg-success/10" : "bg-destructive/10"}
      />

      <StatCard
        testId="stat-savings-rate"
        label="Savings Rate"
        value={`${report.savingsRate.toFixed(1)}%`}
        icon={<PiggyBank className="w-6 h-6 text-primary" />}
        colorClass="text-primary"
        bgClass="bg-primary/10"
      />
    </div>
  )
}
