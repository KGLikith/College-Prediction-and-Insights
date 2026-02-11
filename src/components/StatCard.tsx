import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  className?: string
  variant?: "default" | "success" | "warning" | "info"
}

const variantStyles = {
  default: {
    bg: "bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800",
    icon: "bg-blue-200/70 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300",
  },
  success: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800",
    icon: "bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800",
    icon: "bg-amber-200/70 dark:bg-amber-800/60 text-amber-700 dark:text-amber-300",
  },
  info: {
    bg: "bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-800",
    icon: "bg-violet-200/70 dark:bg-violet-800/60 text-violet-700 dark:text-violet-300",
  },
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  className,
  variant = "default",
}: StatCardProps) => {
  const styles = variantStyles[variant]

  return (
    <Card
      className={cn(
        "shadow-sm hover:shadow-md transition-all duration-300 group",
        "w-full min-w-[280px] max-w-[340px]",

        styles.bg,
        className
      )}
    >
      <CardContent className="flex items-center justify-between pt-2 px-5">
        <div className="space-y-1 max-w-[170px]">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xl font-semibold tracking-tight truncate text-foreground cursor-default">
                  {value}
                </p>
              </TooltipTrigger>
              {typeof value === "string" && value.length > 25 && (
                <TooltipContent
                  side="top"
                  className="
                    bg-foreground
                    text-background
                    border border-border
                    shadow-sm
                    rounded-md
                    px-3 py-2
                    text-sm
                  "
                >
                  {value}
                </TooltipContent>

              )}
            </Tooltip>
          </TooltipProvider>

        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            "transition-transform duration-300 group-hover:scale-110",
            styles.icon
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  )
}
