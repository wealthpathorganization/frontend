"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api, CalendarResponse } from "@/lib/api"
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { BillCalendar, CalendarSummaryCard } from "@/components/calendar/bill-calendar"
import { useLocale } from "next-intl"
import { Calendar, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"

function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] bg-muted rounded-xl" />
        <div className="h-[300px] bg-muted rounded-xl" />
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { formatCurrency } = useCurrency()
  const locale = useLocale()

  const now = new Date()
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth() + 1)

  const {
    data: calendarData,
    isLoading,
    error,
    refetch,
  } = useQuery<CalendarResponse>({
    queryKey: ["recurring-calendar", selectedYear, selectedMonth],
    queryFn: () => api.getRecurringCalendar(selectedYear, selectedMonth),
  })

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
  }

  const handleGoToToday = () => {
    const today = new Date()
    setSelectedYear(today.getFullYear())
    setSelectedMonth(today.getMonth() + 1)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Bills Calendar</h1>
            <p className="text-muted-foreground mt-1">
              View your recurring bills and income
            </p>
          </div>
        </div>
        <CalendarSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Bills Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View your recurring bills and income
          </p>
        </div>
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    )
  }

  const hasBills = calendarData && calendarData.bills.length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Bills Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View your recurring bills and income
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-testid="go-to-today-btn"
            variant="outline"
            onClick={handleGoToToday}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>
          <Button asChild data-testid="add-recurring-btn">
            <Link href={`/${locale}/recurring`}>
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring
            </Link>
          </Button>
        </div>
      </div>

      {!hasBills ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              title="No recurring bills"
              description="Add recurring bills and income to see them on the calendar."
              icon={<Calendar className="w-12 h-12 text-muted-foreground" />}
              action={{
                label: "Add Recurring",
                onClick: () => {
                  window.location.href = `/${locale}/recurring`
                },
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <BillCalendar
              year={selectedYear}
              month={selectedMonth}
              bills={calendarData.bills}
              summary={calendarData.summary}
              formatCurrency={formatCurrency}
              onMonthChange={handleMonthChange}
            />
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <CalendarSummaryCard
              summary={calendarData.summary}
              formatCurrency={formatCurrency}
            />

            {/* Upcoming Bills List */}
            <Card data-testid="upcoming-bills-list">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Upcoming Bills
                </h3>
                <div className="space-y-3">
                  {calendarData.bills
                    .filter((bill) => {
                      const billDate = new Date(bill.dueDate)
                      const today = new Date()
                      return billDate >= today && bill.type === "expense"
                    })
                    .sort(
                      (a, b) =>
                        new Date(a.dueDate).getTime() -
                        new Date(b.dueDate).getTime()
                    )
                    .slice(0, 5)
                    .map((bill, index) => {
                      const dueDate = new Date(bill.dueDate)
                      const today = new Date()
                      const daysUntil = Math.ceil(
                        (dueDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )

                      return (
                        <div
                          key={`${bill.id}-${index}`}
                          data-testid={`upcoming-bill-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                        >
                          <div>
                            <p className="font-medium text-sm">{bill.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {daysUntil === 0
                                ? "Due today"
                                : daysUntil === 1
                                ? "Due tomorrow"
                                : `Due in ${daysUntil} days`}
                            </p>
                          </div>
                          <span className="font-semibold text-destructive">
                            -{formatCurrency(bill.amount)}
                          </span>
                        </div>
                      )
                    })}
                  {calendarData.bills.filter((bill) => {
                    const billDate = new Date(bill.dueDate)
                    const today = new Date()
                    return billDate >= today && bill.type === "expense"
                  }).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming bills this month
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Income List */}
            <Card data-testid="upcoming-income-list">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Upcoming Income
                </h3>
                <div className="space-y-3">
                  {calendarData.bills
                    .filter((bill) => {
                      const billDate = new Date(bill.dueDate)
                      const today = new Date()
                      return billDate >= today && bill.type === "income"
                    })
                    .sort(
                      (a, b) =>
                        new Date(a.dueDate).getTime() -
                        new Date(b.dueDate).getTime()
                    )
                    .slice(0, 5)
                    .map((bill, index) => {
                      const dueDate = new Date(bill.dueDate)
                      const today = new Date()
                      const daysUntil = Math.ceil(
                        (dueDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )

                      return (
                        <div
                          key={`${bill.id}-${index}`}
                          data-testid={`upcoming-income-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/10"
                        >
                          <div>
                            <p className="font-medium text-sm">{bill.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {daysUntil === 0
                                ? "Today"
                                : daysUntil === 1
                                ? "Tomorrow"
                                : `In ${daysUntil} days`}
                            </p>
                          </div>
                          <span className="font-semibold text-success">
                            +{formatCurrency(bill.amount)}
                          </span>
                        </div>
                      )
                    })}
                  {calendarData.bills.filter((bill) => {
                    const billDate = new Date(bill.dueDate)
                    const today = new Date()
                    return billDate >= today && bill.type === "income"
                  }).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming income this month
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
