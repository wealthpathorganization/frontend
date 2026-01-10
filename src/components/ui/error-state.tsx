import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from "lucide-react"

type ErrorStateVariant = "default" | "network" | "server" | "notFound"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  variant?: ErrorStateVariant
  error?: Error | string | null
  onRetry?: () => void
  retryLabel?: string
}

const variantConfig: Record<
  ErrorStateVariant,
  { icon: React.ReactNode; defaultTitle: string; defaultDescription: string }
> = {
  default: {
    icon: <AlertCircle className="w-12 h-12 text-destructive" />,
    defaultTitle: "Something went wrong",
    defaultDescription: "An unexpected error occurred. Please try again.",
  },
  network: {
    icon: <WifiOff className="w-12 h-12 text-destructive" />,
    defaultTitle: "Connection error",
    defaultDescription: "Please check your internet connection and try again.",
  },
  server: {
    icon: <ServerCrash className="w-12 h-12 text-destructive" />,
    defaultTitle: "Server error",
    defaultDescription: "Our servers are having trouble. Please try again later.",
  },
  notFound: {
    icon: <AlertCircle className="w-12 h-12 text-warning" />,
    defaultTitle: "Not found",
    defaultDescription: "The requested resource could not be found.",
  },
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      title,
      description,
      icon,
      variant = "default",
      error,
      onRetry,
      retryLabel = "Try again",
      ...props
    },
    ref
  ) => {
    const config = variantConfig[variant]
    const displayIcon = icon || config.icon
    const displayTitle = title || config.defaultTitle
    const displayDescription =
      description ||
      (typeof error === "string" ? error : error?.message) ||
      config.defaultDescription

    return (
      <div
        ref={ref}
        data-testid="error-state"
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
        {...props}
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          {displayIcon}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {displayDescription}
        </p>
        {onRetry && (
          <Button
            data-testid="error-state-retry"
            onClick={onRetry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </Button>
        )}
      </div>
    )
  }
)
ErrorState.displayName = "ErrorState"

export { ErrorState }
export type { ErrorStateProps }
