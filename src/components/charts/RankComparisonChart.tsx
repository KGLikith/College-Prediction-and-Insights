"use client"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { College } from "@/lib/types"

interface RankScatterChartProps {
  colleges: College[]
  title?: string
}

export const RankComparisonChart = ({
  colleges,
  title = "GM Rank vs Cutoff Rank (College Comparison)",
}: RankScatterChartProps) => {
  const data = colleges.slice(0, 50).map((college) => ({
    x: college.gmRank,
    y: college.cutoffRank,
    college: college.collegeName,
    course: college.course,
  }))

  if (!data.length) {
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
              opacity={0.4}
            />

            <XAxis
              type="number"
              dataKey="x"
              name="GM Rank"
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickFormatter={(v) =>
                typeof v === "number" ? v.toLocaleString() : ""
              }
              label={{
                value: "GM Rank",
                position: "insideBottom",
                offset: -5,
                fill: "currentColor",
              }}
            />

            <YAxis
              type="number"
              dataKey="y"
              name="Cutoff Rank"
              tick={{ fill: "currentColor", fontSize: 12 }}
              tickFormatter={(v) =>
                typeof v === "number" ? v.toLocaleString() : ""
              }
              label={{
                value: "Cutoff Rank",
                angle: -90,
                position: "insideLeft",
                fill: "currentColor",
              }}
            />

            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload

                return (
                  <div className="bg-background text-foreground border rounded-lg p-3 shadow-md max-w-sm text-sm">
                    <p className="font-semibold mb-1">{d.course}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {d.college}
                    </p>
                    <p>
                      <strong>GM Rank:</strong>{" "}
                      {d.x.toLocaleString()}
                    </p>
                    <p>
                      <strong>Cutoff Rank:</strong>{" "}
                      {d.y.toLocaleString()}
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Gap: {(d.x - d.y).toLocaleString()}
                    </p>
                  </div>
                )
              }}
            />

            <Scatter
              data={data}
              fill="#60a5fa"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
