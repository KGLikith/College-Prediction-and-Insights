"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { CourseWithCutoff } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown } from "lucide-react"
import { useMemo } from "react"

interface CutoffDivergingChartProps {
  courses: CourseWithCutoff[]
  title?: string
}

export const CutoffDivergingChart = ({
  courses,
  title = "Course-wise Cut-off Rank Comparison",
}: CutoffDivergingChartProps) => {
  if (!courses || courses.length === 0) {
    return (
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <TrendingDown className="h-12 w-12 mb-3 opacity-20" />
          No rank data available
        </CardContent>
      </Card>
    )
  }

  const data = useMemo(() => {
    return courses
      .filter(
        (c) =>
          typeof c.courseRank === "number" &&
          typeof c.minRank === "number"
      )
      .map((course) => ({
        courseKey: course.courseName,
        fullCourseName: course.courseName,
        cutoffRank: -course.courseRank,
        minRank: course.minRank,
      }))
  }, [courses])

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Direct comparison of cutoff rank and minimum eligible rank per course
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={440}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 80, left: 80, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="4 4" vertical={false} />

            <ReferenceLine x={0} stroke="#9ca3af" strokeDasharray="3 3" />

            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              domain={[
                (dataMin: number) => dataMin,
                (dataMax: number) => dataMax,
              ]}
              tickFormatter={(v) => Math.abs(v).toLocaleString()}
            />

            <YAxis
              dataKey="courseKey"
              type="category"
              width={180}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              fontWeight={500}
              tickFormatter={(value: string) =>
                value.length > 22 ? value.slice(0, 22) + "…" : value
              }
            />

            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload

                return (
                  <div className="rounded-lg border bg-background p-4 shadow-lg max-w-sm">
                    <p className="font-bold text-sm mb-2 text-foreground">
                      {d.fullCourseName}
                    </p>
                    <div className="space-y-1 text-sm text-foreground">
                      <p>
                        <strong className="text-blue-600">
                          Cutoff Rank:
                        </strong>{" "}
                        {Math.abs(d.cutoffRank).toLocaleString()}
                      </p>
                      <p>
                        <strong className="text-purple-600 ">
                          Minimum Rank:
                        </strong>{" "}
                        {d.minRank.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              }}
            />

            <Bar
              dataKey="cutoffRank"
              fill="#3b82f6"
              radius={[8, 0, 0, 8]}
              maxBarSize={28}
              name="Cutoff Rank"
            />

            <Bar
              dataKey="minRank"
              fill="#a855f7"
              radius={[0, 8, 8, 0]}
              maxBarSize={28}
              name="Minimum Rank"
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
          <p>
            This chart presents rank values only and does not infer admission
            competitiveness or probability.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
