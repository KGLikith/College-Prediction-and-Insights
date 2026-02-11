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
import { TrendingUp, TrendingDown, Zap } from "lucide-react"

interface CompetitivenessRangeChartProps {
  colleges: CollegeRanking[]
  title?: string
}

export const CompetitivenessRangeChart = ({
  colleges,
  title = "Course Competitiveness Range for Top 10 Colleges",
}: CompetitivenessRangeChartProps) => {
  const truncateCollegeName = (name: string, maxLength: number = 32) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name
  }

  const data = colleges.slice(0, 12).map((college) => ({
    college: `${truncateCollegeName(college.collegeName)} - ${college.collegeID}`,
    fullName: college.collegeName,
    mostRank: college.mostCompetitiveRank,
    leastRank: college.leastCompetitiveRank,
    range: college.leastCompetitiveRank - college.mostCompetitiveRank,
    mostCourse: college.mostCompetitiveCourse,
    leastCourse: college.leastCompetitiveCourse,
    id: `${college.collegeID}-${college.collegeName}`,
  }))

  data.sort((a, b) => a.mostRank - b.mostRank)

  if (data.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
          <Zap className="h-12 w-12 mb-3 opacity-20" />
          No data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow pt-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
        <div className=" pt-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Shows the range between most and least competitive courses per college</p>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={Math.max(data.length * 45 + 80, 420)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 15, right: 30, left: 20, bottom: 15 }}
            barCategoryGap="15%"
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />

            <XAxis
              type="number"
              stroke="#9ca3af"
              fontSize={12}
              label={{ value: "Rank", position: "insideBottomRight", offset: -10 }}
            />

            <YAxis
              dataKey="college"
              type="category"
              width={260}
              tickLine={false}
              stroke="#6b7280"
              style={{ fontSize: "12px", fontWeight: 500 }}
              tick={{ fill: "#374151", textAnchor: "end" }}
            />

            <Tooltip
              cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload

                return (
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#1f2937",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "14px",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                      maxWidth: "380px",
                    }}
                  >
                    <p className="font-bold text-sm mb-3 text-slate-900">{d.fullName}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span>
                          <strong>Most Competitive:</strong> {d.mostCourse} (Rank{" "}
                          <span className="font-semibold text-emerald-600">{d.mostRank}</span>)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingDown className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span>
                          <strong>Least Competitive:</strong> {d.leastCourse} (Rank{" "}
                          <span className="font-semibold text-amber-600">{d.leastRank}</span>)
                        </span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <p className="text-sm font-semibold text-indigo-600">Range: {d.range} ranks</p>
                      </div>
                    </div>
                  </div>
                )
              }}
            />

            <Bar
              dataKey="leastRank"
              fill="#6366f1"
              radius={[0, 8, 8, 0]}
              animationDuration={800}
              opacity={0.9}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 pt-4 border-t space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Understanding the chart</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="h-3 w-12 rounded bg-indigo-500 flex-shrink-0 mt-0.5"></div>
              <div>
                <p className="font-medium text-slate-900">Range Bar</p>
                <p className="text-xs text-muted-foreground">Gap between most and least competitive courses</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Most Competitive</p>
                <p className="text-xs text-muted-foreground">Lowest rank requirement</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingDown className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Least Competitive</p>
                <p className="text-xs text-muted-foreground">Highest rank requirement</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic pt-2">Larger ranges indicate more course diversity in competitiveness</p>
        </div>
      </CardContent>
    </Card>
  )
}
