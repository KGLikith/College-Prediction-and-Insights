import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { College } from "@/lib/types"

interface ChanceDonutChartProps {
  colleges: College[]
  title?: string
}

const COLORS = {
  high: "hsl(var(--chart-high))",
  medium: "hsl(var(--chart-medium))",
  low: "hsl(var(--chart-low))",
}

export const ChanceDonutChart = ({
  colleges,
  title = "Chance Distribution",
}: ChanceDonutChartProps) => {
  // 1️⃣ Count occurrences
  const highCount = colleges.filter((c) => c.chances === "high").length
  const mediumCount = colleges.filter((c) => c.chances === "medium").length
  const lowCount = colleges.filter((c) => c.chances === "low").length

  // 2️⃣ Total count
  const total = highCount + mediumCount + lowCount

  // 3️⃣ Build data safely
  const data =
    total === 0
      ? []
      : [
          {
            name: "High",
            value: highCount,
            percentage: (highCount / total) * 100,
            color: COLORS.high,
          },
          {
            name: "Medium",
            value: mediumCount,
            percentage: (mediumCount / total) * 100,
            color: COLORS.medium,
          },
          {
            name: "Low",
            value: lowCount,
            percentage: (lowCount / total) * 100,
            color: COLORS.low,
          },
        ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Card className="animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in shadow-lg hover:shadow-xl transition-shadow duration-300 border-2">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              animationDuration={1000}
              label={({ name, payload }) =>
                `${name}: ${payload.percentage.toFixed(0)}%`
              }
              labelLine={{
                stroke: "hsl(var(--foreground))",
                strokeWidth: 1,
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number | undefined, name: string | undefined, props: any) => [
                `${value ?? 0} (${props.payload.percentage.toFixed(1)}%)`,
                name ?? "",
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "2px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "12px",
              }}
              labelStyle={{
                color: "hsl(var(--foreground))",
                fontWeight: "600",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={40}
              formatter={(value) => (
                <span className="text-foreground text-sm font-medium">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
