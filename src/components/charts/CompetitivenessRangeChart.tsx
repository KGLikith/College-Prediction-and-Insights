import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CollegeRanking } from "@/lib/types"

interface CompetitivenessRangeChartProps {
  colleges: CollegeRanking[]
  title?: string
}

export const CompetitivenessRangeChart = ({
  colleges,
  title = "Course Competitiveness Range",
}: CompetitivenessRangeChartProps) => {
  // 🔁 Course-first transformation
  const data = colleges
    .slice(0, 12)
    .flatMap((college) => [
      {
        course: college.mostCompetitiveCourse,
        college: college.collegeName,
        rank: college.mostCompetitiveRank,
        type: "Most Competitive",
        color: "hsl(var(--chart-high))",
      },
      {
        course: college.leastCompetitiveCourse,
        college: college.collegeName,
        rank: college.leastCompetitiveRank,
        type: "Least Competitive",
        color: "hsl(var(--chart-low))",
      },
    ])

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" />

            {/* ✅ COURSE FIRST */}
            <YAxis
              dataKey="course"
              type="category"
              width={260}
              tickLine={false}
              style={{ fontSize: "12px" }}
            />

            {/* ✅ CLEAN WHITE TOOLTIP */}
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
                      maxWidth: "340px",
                    }}
                  >
                    <p className="font-semibold text-sm mb-2">
                      {d.course}
                    </p>
                    <p className="text-sm">
                      <strong>College:</strong>
                      <br />
                      {d.college}
                    </p>
                    <p className="text-sm mt-2">
                      <strong>{d.type} Rank:</strong> {d.rank}
                    </p>
                  </div>
                )
              }}
            />

            <Bar
              dataKey="rank"
              radius={[0, 4, 4, 0]}
              isAnimationActive
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
