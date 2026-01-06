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
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-2 w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>

      <CardContent className="w-full">
        <ResponsiveContainer width="100%" height={460}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              tickFormatter={(v) => v.toLocaleString()}
            />

            {/* ✅ LEFT-ALIGNED, TRUNCATED COURSE NAMES */}
            <YAxis
              dataKey="courseShort"
              type="category"
              width={260}
              tickLine={false}
              tick={({ x, y, payload }) => (
                <text
                  x={x - 6}
                  y={y}
                  dy={4}
                  textAnchor="end"
                  fill="#6b7280"
                  fontSize={12}
                >
                  {payload.value}
                </text>
              )}
            />

            {/* ✅ WHITE, LEFT-ALIGNED TOOLTIP */}
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null

                const d = payload[0].payload

                return (
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "12px",
                      boxShadow:
                        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                      maxWidth: "360px",
                      textAlign: "left",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        marginBottom: "4px",
                      }}
                    >
                      {d.course}
                    </p>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "#4b5563",
                        marginBottom: "8px",
                      }}
                    >
                      {d.college}
                    </p>

                    <p style={{ fontSize: "13px" }}>
                      <strong>Cutoff Rank:</strong>{" "}
                      {d.cutoffRank.toLocaleString()}
                    </p>
                    <p style={{ fontSize: "13px" }}>
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
