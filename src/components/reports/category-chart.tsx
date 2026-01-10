"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { TopCategory, CategoryTrend } from "@/lib/api"

const COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#6366F1",
  "#84CC16",
]

interface CategoryPieChartProps {
  categories: TopCategory[]
  formatCurrency: (amount: string | number) => string
  title?: string
}

export function CategoryPieChart({
  categories,
  formatCurrency,
  title = "Top Spending Categories",
}: CategoryPieChartProps) {
  const chartData = categories.map((cat) => ({
    name: cat.category,
    value: parseFloat(cat.amount),
    percentage: cat.percentage,
    transactionCount: cat.transactionCount,
  }))

  return (
    <Card data-testid="category-pie-chart">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {chartData.slice(0, 5).map((item, index) => (
            <div
              key={item.name}
              data-testid={`category-legend-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {item.percentage.toFixed(1)}%
                </span>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface CategoryTrendsChartProps {
  trends: CategoryTrend[]
  formatCurrency: (amount: string | number) => string
  title?: string
}

export function CategoryTrendsChart({
  trends,
  formatCurrency,
  title = "Spending Trends",
}: CategoryTrendsChartProps) {
  // Transform data for area chart - combine all categories by month
  const monthsSet = new Set<string>()
  trends.forEach((trend) => {
    trend.monthlyData.forEach((data) => monthsSet.add(data.month))
  })
  const months = Array.from(monthsSet).sort()

  const chartData = months.map((month) => {
    const entry: Record<string, string | number> = { month }
    trends.forEach((trend) => {
      const monthData = trend.monthlyData.find((d) => d.month === month)
      entry[trend.category] = monthData ? parseFloat(monthData.amount) : 0
    })
    return entry
  })

  return (
    <Card data-testid="category-trends-chart">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {trends.map((trend, index) => (
                  <linearGradient
                    key={trend.category}
                    id={`color-${trend.category}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS[index % COLORS.length]}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS[index % COLORS.length]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tickFormatter={(value) => {
                  const date = new Date(value + "-01")
                  return date.toLocaleDateString(undefined, { month: "short" })
                }}
              />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelFormatter={(label) => {
                  const date = new Date(label + "-01")
                  return date.toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })
                }}
              />
              {trends.slice(0, 5).map((trend, index) => (
                <Area
                  key={trend.category}
                  type="monotone"
                  dataKey={trend.category}
                  stroke={COLORS[index % COLORS.length]}
                  fillOpacity={1}
                  fill={`url(#color-${trend.category})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {trends.slice(0, 5).map((trend, index) => (
            <div
              key={trend.category}
              data-testid={`trend-legend-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{trend.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium ${
                    trend.trendDirection === "increasing"
                      ? "text-destructive"
                      : trend.trendDirection === "decreasing"
                      ? "text-success"
                      : "text-muted-foreground"
                  }`}
                >
                  {trend.trendDirection === "increasing"
                    ? "+"
                    : trend.trendDirection === "decreasing"
                    ? ""
                    : ""}
                  {trend.trendPercentage.toFixed(1)}%
                </span>
                <span className="font-medium">
                  {formatCurrency(trend.averageAmount)}/mo
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
