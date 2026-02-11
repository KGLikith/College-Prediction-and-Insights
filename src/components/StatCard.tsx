import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  className?: string
  variant?: "default" | "success" | "warning" | "info"
}

const variantStyles = {
  default: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  success: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  info: {
    bg: "bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900",
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
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
        "border-0 hover:shadow-lg transition-all duration-300 overflow-hidden group",
        "max-w-[260px]", 
        styles.bg,
        className
      )}
    >
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1 max-w-[170px]">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>

          <p className="text-md font-bold tracking-tight truncate">
            {value}
          </p>
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
