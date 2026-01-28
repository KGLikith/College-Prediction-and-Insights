import { CourseInfo, CourseWithCutoff } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface CourseRankChartProps {
  courses: (CourseInfo | CourseWithCutoff)[]
  title?: string
}

type Tier = "top" | "middle" | "bottom"

const getTier = (rank: number, maxRank: number): Tier => {
  const third = maxRank / 3
  if (rank <= third) return "top"
  if (rank <= third * 2) return "middle"
  return "bottom"
}

const tierStyles = {
  top: {
    bg: "bg-emerald-500",
    text: "text-emerald-900",
    label: "Top Tier",
    description: "Most competitive courses",
  },
  middle: {
    bg: "bg-amber-500",
    text: "text-amber-900",
    label: "Mid Tier",
    description: "Moderately competitive courses",
  },
  bottom: {
    bg: "bg-red-500",
    text: "text-red-900",
    label: "Bottom Tier",
    description: "Least competitive courses",
  },
}

export const CourseRankHeatmap = ({ 
  courses, 
  title = "Course Rankings Heatmap"
}: CourseRankChartProps) => {
  if (courses.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <TrendingUp className="h-12 w-12 mb-3 opacity-20" />
          No data available
        </CardContent>
      </Card>
    )
  }

  // Extract ranks and find max for tier calculation
  const ranks = courses.map(c => c.courseRank)
  const maxRank = Math.max(...ranks)
  const minRank = Math.min(...ranks)

  // Group courses by tier
  const tieredCourses = courses.map(course => ({
    ...course,
    tier: getTier(course.courseRank, maxRank),
    rankPercentage: ((course.courseRank - minRank) / (maxRank - minRank)) * 100,
  }))

  const topTier = tieredCourses.filter(c => c.tier === "top").sort((a, b) => a.courseRank - b.courseRank)
  const middleTier = tieredCourses.filter(c => c.tier === "middle").sort((a, b) => a.courseRank - b.courseRank)
  const bottomTier = tieredCourses.filter(c => c.tier === "bottom").sort((a, b) => a.courseRank - b.courseRank)

  const renderTierSection = (tier: Tier, courses: typeof tieredCourses) => {
    const style = tierStyles[tier]
    
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{style.label}</p>
          <p className="text-xs text-muted-foreground">{style.description}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {courses.map((course) => (
            <div
              key={course.courseName}
              className={`relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-default ${style.bg} bg-opacity-15 border-l-4`}
              style={{
                borderLeftColor: style.bg,
              }}
            >
              {/* Background heatmap indicator */}
              <div
                className={`absolute inset-0 ${style.bg} opacity-5`}
                style={{
                  width: `${course.rankPercentage}%`,
                  transition: "width 0.6s ease-out",
                }}
              ></div>

              <div className="relative z-10 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-tight flex-1">{course.courseName}</p>
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${style.bg} font-bold text-white text-xs flex-shrink-0`}>
                    {course.courseRank}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Rank</span>
                  <span className="text-xs font-semibold">{course.courseRank.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="border-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-red-50 dark:from-emerald-950 dark:to-red-950 border-b">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        {topTier.length > 0 && renderTierSection("top", topTier)}
        {middleTier.length > 0 && renderTierSection("middle", middleTier)}
        {bottomTier.length > 0 && renderTierSection("bottom", bottomTier)}

        {/* Legend */}
        <div className="border-t pt-4 mt-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">How to read this heatmap</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <span className="text-muted-foreground">Most competitive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
              <span className="text-muted-foreground">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground">Least competitive</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
