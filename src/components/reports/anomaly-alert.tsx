"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
} from "lucide-react"
import type { Anomaly } from "@/lib/api"

interface AnomalyAlertProps {
  anomaly: Anomaly
  formatCurrency: (amount: string | number) => string
}

const severityConfig = {
  info: {
    bgClass: "bg-primary/5 border-primary/20",
    iconClass: "text-primary",
    Icon: Info,
  },
  warning: {
    bgClass: "bg-warning/5 border-warning/20",
    iconClass: "text-warning",
    Icon: AlertTriangle,
  },
  critical: {
    bgClass: "bg-destructive/5 border-destructive/20",
    iconClass: "text-destructive",
    Icon: AlertCircle,
  },
}

const typeIcons: Record<Anomaly["type"], React.ElementType> = {
  unusual_expense: TrendingUp,
  unusual_income: TrendingDown,
  missed_income: DollarSign,
  budget_exceeded: Target,
}

export function AnomalyAlert({ anomaly, formatCurrency }: AnomalyAlertProps) {
  const config = severityConfig[anomaly.severity]
  const TypeIcon = typeIcons[anomaly.type]

  return (
    <div
      data-testid={`anomaly-${anomaly.type}`}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border",
        config.bgClass
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <config.Icon className={cn("w-5 h-5", config.iconClass)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{anomaly.category}</p>
          {parseFloat(anomaly.amount) > 0 && (
            <span className="text-xs text-muted-foreground">
              {formatCurrency(anomaly.amount)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {anomaly.description}
        </p>
      </div>
      <div className="flex-shrink-0">
        <TypeIcon className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  )
}

interface AnomalyListProps {
  anomalies: Anomaly[]
  formatCurrency: (amount: string | number) => string
  title?: string
}

export function AnomalyList({
  anomalies,
  formatCurrency,
  title = "Insights & Anomalies",
}: AnomalyListProps) {
  if (anomalies.length === 0) {
    return (
      <Card data-testid="anomaly-list-empty">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <Info className="w-6 h-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">
              No anomalies detected. Your spending looks normal!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort by severity: critical first, then warning, then info
  const sortedAnomalies = [...anomalies].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  return (
    <Card data-testid="anomaly-list">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {anomalies.some((a) => a.severity === "critical") && (
            <span className="w-2 h-2 rounded-full bg-destructive" />
          )}
          {!anomalies.some((a) => a.severity === "critical") &&
            anomalies.some((a) => a.severity === "warning") && (
              <span className="w-2 h-2 rounded-full bg-warning" />
            )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedAnomalies.map((anomaly, index) => (
          <AnomalyAlert
            key={`${anomaly.type}-${anomaly.category}-${index}`}
            anomaly={anomaly}
            formatCurrency={formatCurrency}
          />
        ))}
      </CardContent>
    </Card>
  )
}
