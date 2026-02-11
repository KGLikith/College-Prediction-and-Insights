import { cn } from "@/lib/utils"

type Chance = "high" | "medium" | "low"

interface ChanceBadgeProps {
  chance: Chance
  className?: string
}

const chanceStyles: Record<Chance, string> = {
  high:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",

  medium:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",

  low:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
}

const chanceLabels: Record<Chance, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

export const ChanceBadge = ({ chance, className }: ChanceBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
        chanceStyles[chance],
        className
      )}
    >
      {chanceLabels[chance]}
    </span>
  )
}
