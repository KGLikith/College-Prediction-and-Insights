import { cn } from "@/lib/utils"

type Chance = "high" | "medium" | "low"

interface ChanceBadgeProps {
  chance: Chance
  className?: string
}

const chanceStyles: Record<Chance, string> = {
  high: "bg-chart-high/15 text-chart-high border-chart-high/30 font-semibold",
  medium: "bg-chart-medium/15 text-chart-medium border-chart-medium/30 font-semibold",
  low: "bg-chart-low/15 text-chart-low border-chart-low/30 font-semibold",
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
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 shadow-sm transition-all duration-200 hover:scale-105",
        chanceStyles[chance],
        className,
      )}
    >
      {chanceLabels[chance]}
    </span>
  )
}
