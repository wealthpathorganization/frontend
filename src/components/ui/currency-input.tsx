"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string | number
  onChange: (value: string) => void
  currency?: string
  showQuickAmounts?: boolean
}

// Parse shorthand like "5m", "500k", "1.5m" into numbers
function parseShorthand(input: string): number | null {
  const cleaned = input.toLowerCase().replace(/[,\s]/g, "")
  
  const match = cleaned.match(/^(\d+\.?\d*)(k|m|b)?$/)
  if (!match) return null
  
  const num = parseFloat(match[1])
  const suffix = match[2]
  
  switch (suffix) {
    case "k":
      return num * 1_000
    case "m":
      return num * 1_000_000
    case "b":
      return num * 1_000_000_000
    default:
      return num
  }
}

// Format number with thousand separators
function formatWithSeparators(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value
  if (isNaN(num)) return ""
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 })
}

// Get quick amounts based on currency
function getQuickAmounts(currency: string): { label: string; value: number }[] {
  const isHighValueCurrency = ["VND", "IDR", "KRW", "JPY"].includes(currency)
  
  if (isHighValueCurrency) {
    return [
      { label: "+100K", value: 100_000 },
      { label: "+500K", value: 500_000 },
      { label: "+1M", value: 1_000_000 },
      { label: "+5M", value: 5_000_000 },
    ]
  }
  
  return [
    { label: "+10", value: 10 },
    { label: "+50", value: 50 },
    { label: "+100", value: 100 },
    { label: "+500", value: 500 },
  ]
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, currency = "USD", showQuickAmounts = true, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")
    
    // Sync display value when external value changes
    React.useEffect(() => {
      if (value !== undefined && value !== "") {
        setDisplayValue(formatWithSeparators(value))
      } else {
        setDisplayValue("")
      }
    }, [value])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      
      // Allow typing shorthand
      if (/^[\d.,kmb\s]*$/i.test(input)) {
        setDisplayValue(input)
        
        // Try to parse and emit raw number
        const parsed = parseShorthand(input)
        if (parsed !== null) {
          onChange(parsed.toString())
        } else {
          // Just strip commas for raw value
          onChange(input.replace(/,/g, ""))
        }
      }
    }
    
    const handleBlur = () => {
      // Format on blur
      const parsed = parseShorthand(displayValue)
      if (parsed !== null) {
        setDisplayValue(formatWithSeparators(parsed))
        onChange(parsed.toString())
      }
    }
    
    const handleQuickAmount = (amount: number) => {
      const current = parseFloat(String(value).replace(/,/g, "")) || 0
      const newValue = current + amount
      setDisplayValue(formatWithSeparators(newValue))
      onChange(newValue.toString())
    }
    
    const quickAmounts = getQuickAmounts(currency)
    
    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
              className
            )}
            ref={ref}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0 or 5m, 500k..."
            {...props}
          />
        </div>
        {showQuickAmounts && (
          <div className="flex gap-1 flex-wrap">
            {quickAmounts.map((qa) => (
              <button
                key={qa.value}
                type="button"
                onClick={() => handleQuickAmount(qa.value)}
                className="px-2 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                {qa.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }

