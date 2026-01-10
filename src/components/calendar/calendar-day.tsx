"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { CalendarBill } from "@/lib/api"

interface CalendarDayProps {
  day: number
  date: Date
  bills: CalendarBill[]
  isToday: boolean
  isOtherMonth: boolean
  onClick?: (date: Date, bills: CalendarBill[]) => void
  formatCurrency: (amount: string | number) => string
}

export function CalendarDay({
  day,
  date,
  bills,
  isToday,
  isOtherMonth,
  onClick,
  formatCurrency,
}: CalendarDayProps) {
  const hasBills = bills.length > 0
  const hasIncome = bills.some((b) => b.type === "income")
  const hasExpense = bills.some((b) => b.type === "expense")

  const handleClick = () => {
    if (onClick && hasBills) {
      onClick(date, bills)
    }
  }

  return (
    <div
      data-testid={`calendar-day-${day}`}
      className={cn(
        "min-h-24 p-2 border rounded-lg transition-colors",
        isToday && "border-primary bg-primary/5",
        isOtherMonth && "opacity-50",
        hasBills && "cursor-pointer hover:bg-muted/50",
        !hasBills && !isToday && "border-transparent"
      )}
      onClick={handleClick}
      role={hasBills ? "button" : undefined}
      tabIndex={hasBills ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasBills && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm font-medium",
            isToday &&
              "w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs"
          )}
        >
          {day}
        </span>
        {hasBills && (
          <div className="flex gap-1">
            {hasIncome && (
              <span className="w-2 h-2 rounded-full bg-success" />
            )}
            {hasExpense && (
              <span className="w-2 h-2 rounded-full bg-destructive" />
            )}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {bills.slice(0, 2).map((bill, index) => (
          <CalendarBillItem
            key={`${bill.id}-${index}`}
            bill={bill}
            formatCurrency={formatCurrency}
          />
        ))}
        {bills.length > 2 && (
          <div className="text-xs text-muted-foreground text-center">
            +{bills.length - 2} more
          </div>
        )}
      </div>
    </div>
  )
}

interface CalendarBillItemProps {
  bill: CalendarBill
  formatCurrency: (amount: string | number) => string
  showAmount?: boolean
}

export function CalendarBillItem({
  bill,
  formatCurrency,
  showAmount = false,
}: CalendarBillItemProps) {
  const isIncome = bill.type === "income"

  return (
    <div
      data-testid={`bill-item-${bill.id}`}
      className={cn(
        "text-xs p-1 rounded truncate",
        isIncome
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      )}
      title={`${bill.name} - ${formatCurrency(bill.amount)}`}
    >
      {showAmount ? (
        <div className="flex items-center justify-between">
          <span className="truncate">{bill.name}</span>
          <span className="font-medium ml-2">
            {isIncome ? "+" : "-"}
            {formatCurrency(bill.amount)}
          </span>
        </div>
      ) : (
        bill.name
      )}
    </div>
  )
}

interface DayDetailModalProps {
  date: Date
  bills: CalendarBill[]
  formatCurrency: (amount: string | number) => string
  onClose: () => void
}

export function DayDetailContent({
  date,
  bills,
  formatCurrency,
}: Omit<DayDetailModalProps, "onClose">) {
  const income = bills.filter((b) => b.type === "income")
  const expenses = bills.filter((b) => b.type === "expense")
  const totalIncome = income.reduce(
    (sum, b) => sum + parseFloat(b.amount),
    0
  )
  const totalExpenses = expenses.reduce(
    (sum, b) => sum + parseFloat(b.amount),
    0
  )

  return (
    <div data-testid="day-detail-content" className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-semibold">
          {date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {income.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-success mb-2">
            Income ({income.length})
          </h4>
          <div className="space-y-2">
            {income.map((bill, index) => (
              <div
                key={`${bill.id}-${index}`}
                className="flex items-center justify-between p-2 rounded-lg bg-success/10"
              >
                <div>
                  <p className="font-medium text-sm">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bill.category}
                  </p>
                </div>
                <span className="font-semibold text-success">
                  +{formatCurrency(bill.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-right text-sm font-medium text-success">
            Total: +{formatCurrency(totalIncome)}
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-destructive mb-2">
            Expenses ({expenses.length})
          </h4>
          <div className="space-y-2">
            {expenses.map((bill, index) => (
              <div
                key={`${bill.id}-${index}`}
                className="flex items-center justify-between p-2 rounded-lg bg-destructive/10"
              >
                <div>
                  <p className="font-medium text-sm">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bill.category}
                  </p>
                </div>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(bill.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-right text-sm font-medium text-destructive">
            Total: -{formatCurrency(totalExpenses)}
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="font-medium">Net Cash Flow</span>
          <span
            className={cn(
              "font-bold",
              totalIncome - totalExpenses >= 0
                ? "text-success"
                : "text-destructive"
            )}
          >
            {totalIncome - totalExpenses >= 0 ? "+" : "-"}
            {formatCurrency(Math.abs(totalIncome - totalExpenses))}
          </span>
        </div>
      </div>
    </div>
  )
}
