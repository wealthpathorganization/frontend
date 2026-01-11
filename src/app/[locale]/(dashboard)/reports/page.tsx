"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api, MonthlyReport, CategoryTrendsResponse } from "@/lib/api"
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { ReportSummary } from "@/components/reports/report-summary"
import {
  CategoryPieChart,
  CategoryTrendsChart,
} from "@/components/reports/category-chart"
import { AnomalyList } from "@/components/reports/anomaly-alert"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"
import { FileBarChart, TrendingUp, TrendingDown, Minus, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const TREND_PERIODS = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
  { value: "24", label: "24 months" },
]

function ReportsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px] bg-muted rounded-xl" />
        <div className="h-[400px] bg-muted rounded-xl" />
      </div>
    </div>
  )
}

function TrendIndicator({ trend }: { trend: MonthlyReport["comparedToLast"]["trend"] }) {
  const config = {
    improving: {
      icon: TrendingUp,
      label: "Improving",
      className: "text-success bg-success/10",
    },
    stable: {
      icon: Minus,
      label: "Stable",
      className: "text-muted-foreground bg-muted",
    },
    declining: {
      icon: TrendingDown,
      label: "Declining",
      className: "text-destructive bg-destructive/10",
    },
  }

  const { icon: Icon, label, className } = config[trend]

  return (
    <div
      data-testid="trend-indicator"
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </div>
  )
}

export default function ReportsPage() {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const t = useTranslations()

  const now = new Date()
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth() + 1)
  const [trendPeriod, setTrendPeriod] = React.useState("6")
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const { blob, filename } = await api.exportMonthlyReportPDF(selectedYear, selectedMonth)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: t("common.success"), description: t("export.pdfExported") })
    } catch {
      toast({
        title: t("common.error"),
        description: t("export.exportFailed"),
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const years = React.useMemo(() => {
    const currentYear = now.getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear - i)
  }, [])

  const {
    data: report,
    isLoading: isLoadingReport,
    error: reportError,
    refetch: refetchReport,
  } = useQuery<MonthlyReport>({
    queryKey: ["monthly-report", selectedYear, selectedMonth],
    queryFn: () => api.getMonthlyReport(selectedYear, selectedMonth),
  })

  const {
    data: trends,
    isLoading: isLoadingTrends,
    error: trendsError,
    refetch: refetchTrends,
  } = useQuery<CategoryTrendsResponse>({
    queryKey: ["category-trends", trendPeriod],
    queryFn: () => api.getCategoryTrends(parseInt(trendPeriod), 5),
  })

  const isLoading = isLoadingReport || isLoadingTrends
  const hasError = reportError || trendsError

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your financial performance
          </p>
        </div>
        <ReportsSkeleton />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your financial performance
          </p>
        </div>
        <ErrorState
          error={reportError || trendsError}
          onRetry={() => {
            if (reportError) refetchReport()
            if (trendsError) refetchTrends()
          }}
        />
      </div>
    )
  }

  const hasData = report && report.topCategories.length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your financial performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger
              data-testid="month-selector"
              className="w-[140px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={month} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger
              data-testid="year-selector"
              className="w-[100px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting || !hasData}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {t("export.exportPDF")}
          </Button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="No transactions found"
          description="Start tracking your income and expenses to see detailed reports."
          icon={<FileBarChart className="w-12 h-12 text-muted-foreground" />}
          action={{
            label: "Add Transaction",
            onClick: () => {
              window.location.href = "/transactions"
            },
          }}
        />
      ) : (
        <>
          {/* Trend Badge */}
          {report.comparedToLast && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Compared to last month:
              </span>
              <TrendIndicator trend={report.comparedToLast.trend} />
            </div>
          )}

          {/* Summary Stats */}
          <ReportSummary report={report} formatCurrency={formatCurrency} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Pie Chart */}
            <CategoryPieChart
              categories={report.topCategories}
              formatCurrency={formatCurrency}
            />

            {/* Anomalies */}
            <AnomalyList
              anomalies={report.anomalies}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Category Trends Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Spending Trends</h2>
              <Select value={trendPeriod} onValueChange={setTrendPeriod}>
                <SelectTrigger
                  data-testid="trend-period-selector"
                  className="w-[140px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TREND_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {trends && trends.trends.length > 0 ? (
              <CategoryTrendsChart
                trends={trends.trends}
                formatCurrency={formatCurrency}
                title={`Spending Trends (${trendPeriod} months)`}
              />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    variant="search"
                    title="Not enough data"
                    description="Track your expenses for a few months to see spending trends."
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Month Comparison */}
          {report.comparedToLast && (
            <Card data-testid="month-comparison">
              <CardHeader>
                <CardTitle>Month-over-Month Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      Income Change
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        report.comparedToLast.incomeChange >= 0
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {report.comparedToLast.incomeChange >= 0 ? "+" : ""}
                      {report.comparedToLast.incomeChange.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      Expense Change
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        report.comparedToLast.expenseChange <= 0
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {report.comparedToLast.expenseChange >= 0 ? "+" : ""}
                      {report.comparedToLast.expenseChange.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      Savings Change
                    </p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        report.comparedToLast.savingsChange >= 0
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {report.comparedToLast.savingsChange >= 0 ? "+" : ""}
                      {report.comparedToLast.savingsChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
