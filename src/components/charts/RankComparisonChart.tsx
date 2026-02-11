"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { College } from "@/lib/types"

interface RankComparisonChartProps {
  colleges: College[]
  title?: string
}

const truncate = (text: string, max = 28) =>
  text.length > max ? text.slice(0, max) + "…" : text

export const RankComparisonChart = ({
  colleges,
  title = "Course-wise Cutoff vs GM Rank",
}: RankComparisonChartProps) => {
  const data = colleges.slice(0, 10).map((college) => ({
    course: college.course,
    courseShort: truncate(college.course),
    college: college.collegeName,
    cutoffRank: college.cutoffRank,
    gmRank: college.gmRank,
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[420px] flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={440}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              type="number"
              tickFormatter={(v) => v.toLocaleString()}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />

            <YAxis
              dataKey="courseShort"
              type="category"
              width={240}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />

            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const d = payload[0].payload

                return (
                  <div className="bg-background text-foreground border rounded-lg p-3 shadow-md max-w-sm text-sm">
                    <p className="font-semibold mb-1">{d.course}</p>
                    <p className="text-muted-foreground text-xs mb-2">
                      {d.college}
                    </p>
                    <p>
                      <strong>Cutoff:</strong>{" "}
                      {d.cutoffRank.toLocaleString()}
                    </p>
                    <p>
                      <strong>GM Rank:</strong>{" "}
                      {d.gmRank.toLocaleString()}
                    </p>
                  </div>
                )
              }}
            />

            <Legend />

            <Bar
              dataKey="cutoffRank"
              fill="hsl(var(--chart-1))"
              name="Cutoff Rank"
              radius={[0, 6, 6, 0]}
              maxBarSize={26}
            />

            <Bar
              dataKey="gmRank"
              fill="hsl(var(--chart-medium))"
              name="GM Rank"
              radius={[0, 6, 6, 0]}
              maxBarSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
