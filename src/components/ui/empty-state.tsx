import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { FileQuestion, Inbox, Search, FolderOpen } from "lucide-react"

type EmptyStateVariant = "default" | "search" | "folder" | "inbox"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  variant?: EmptyStateVariant
  action?: {
    label: string
    onClick: () => void
  }
}

const variantIcons: Record<EmptyStateVariant, React.ReactNode> = {
  default: <FileQuestion className="w-12 h-12 text-muted-foreground" />,
  search: <Search className="w-12 h-12 text-muted-foreground" />,
  folder: <FolderOpen className="w-12 h-12 text-muted-foreground" />,
  inbox: <Inbox className="w-12 h-12 text-muted-foreground" />,
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      title,
      description,
      icon,
      variant = "default",
      action,
      ...props
    },
    ref
  ) => {
    const displayIcon = icon || variantIcons[variant]

    return (
      <div
        ref={ref}
        data-testid="empty-state"
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
        {...props}
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {displayIcon}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {description}
          </p>
        )}
        {action && (
          <Button
            data-testid="empty-state-action"
            onClick={action.onClick}
            variant="default"
          >
            {action.label}
          </Button>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
export type { EmptyStateProps }
