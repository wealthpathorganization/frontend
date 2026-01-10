"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { CalendarDay, DayDetailContent } from "./calendar-day"
import type { CalendarBill, CalendarSummary } from "@/lib/api"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface BillCalendarProps {
  year: number
  month: number
  bills: CalendarBill[]
  summary: CalendarSummary
  formatCurrency: (amount: string | number) => string
  onMonthChange: (year: number, month: number) => void
}

interface CalendarDayData {
  day: number
  date: Date
  bills: CalendarBill[]
  isToday: boolean
  isOtherMonth: boolean
}

function generateCalendarDays(
  year: number,
  month: number,
  bills: CalendarBill[]
): CalendarDayData[] {
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)
  const startDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  const today = new Date()

  const days: CalendarDayData[] = []

  // Previous month days
  const prevMonth = new Date(year, month - 2, 1)
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day)
    days.push({
      day,
      date,
      bills: [],
      isToday: false,
      isOtherMonth: true,
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = date.toISOString().split("T")[0]
    const dayBills = bills.filter((b) => b.dueDate === dateStr)
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    days.push({
      day,
      date,
      bills: dayBills,
      isToday,
      isOtherMonth: false,
    })
  }

  // Next month days to fill the grid
  const remainingDays = 42 - days.length // 6 weeks * 7 days
  const nextMonth = new Date(year, month, 1)
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i)
    days.push({
      day: i,
      date,
      bills: [],
      isToday: false,
      isOtherMonth: true,
    })
  }

  return days
}

export function BillCalendar({
  year,
  month,
  bills,
  formatCurrency,
  onMonthChange,
}: BillCalendarProps) {
  const [selectedDay, setSelectedDay] = React.useState<{
    date: Date
    bills: CalendarBill[]
  } | null>(null)

  const calendarDays = React.useMemo(
    () => generateCalendarDays(year, month, bills),
    [year, month, bills]
  )

  const monthName = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12)
    } else {
      onMonthChange(year, month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1)
    } else {
      onMonthChange(year, month + 1)
    }
  }

  const handleDayClick = (date: Date, dayBills: CalendarBill[]) => {
    setSelectedDay({ date, bills: dayBills })
  }

  return (
    <>
      <Card data-testid="bill-calendar">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              data-testid="prev-month-btn"
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {monthName}
            </CardTitle>
            <Button
              data-testid="next-month-btn"
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => (
              <CalendarDay
                key={index}
                day={dayData.day}
                date={dayData.date}
                bills={dayData.bills}
                isToday={dayData.isToday}
                isOtherMonth={dayData.isOtherMonth}
                onClick={handleDayClick}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day detail dialog */}
      <Dialog
        open={selectedDay !== null}
        onOpenChange={() => setSelectedDay(null)}
      >
        <DialogContent data-testid="day-detail-dialog">
          <DialogHeader>
            <DialogTitle>Bills for this day</DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <DayDetailContent
              date={selectedDay.date}
              bills={selectedDay.bills}
              formatCurrency={formatCurrency}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

interface CalendarSummaryCardProps {
  summary: CalendarSummary
  formatCurrency: (amount: string | number) => string
}

export function CalendarSummaryCard({
  summary,
  formatCurrency,
}: CalendarSummaryCardProps) {
  const netCashFlow = parseFloat(summary.netCashFlow)
  const isPositive = netCashFlow >= 0

  return (
    <Card data-testid="calendar-summary">
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Income</span>
          <span className="font-semibold text-success">
            +{formatCurrency(summary.totalIncome)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Expenses</span>
          <span className="font-semibold text-destructive">
            -{formatCurrency(summary.totalExpenses)}
          </span>
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Net Cash Flow</span>
            <span
              className={cn(
                "font-bold text-lg",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(summary.netCashFlow)}
            </span>
          </div>
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recurring bills</span>
            <span>{summary.expenseCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recurring income</span>
            <span>{summary.incomeCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
