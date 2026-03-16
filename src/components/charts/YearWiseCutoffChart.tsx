"use client"

import { useEffect, useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingDown } from "lucide-react"

export const CATEGORIES = [
  "GM", "1G", "2AG", "2BG", "3AG", "3BG", "SCG", "STG", "KKR"
]

const ROUND_COLORS: Record<number, string> = {
  1: "#3b82f6",
  2: "#10b981",
  3: "#8b5cf6",
  4: "#f59e0b",
}

interface CourseCode {
  course_name: string
  course_code: string
}

interface CutoffDataPoint {
  year: number
  rank: number
  round: number
}

interface YearWiseCutoffChartProps {
  collegeCode: string
  initialCategory?: string
}

export function YearWiseCutoffChart({ collegeCode, initialCategory = "GM" }: YearWiseCutoffChartProps) {
  const [courses, setCourses] = useState<CourseCode[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [selectedRound, setSelectedRound] = useState<string>("all")
  
  const [cutoffData, setCutoffData] = useState<CutoffDataPoint[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true)
        const res = await fetch(`/api/colleges/kcet/${collegeCode}/course-codes`)
        if (!res.ok) throw new Error("Failed to fetch courses")
        const data = await res.json()
        const courseList = data.colleges?.[0]?.CourseList || []
        setCourses(courseList)
        if (courseList.length > 0) {
          setSelectedCourse(courseList[0].course_code)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [collegeCode])

  useEffect(() => {
    if (!selectedCourse || !selectedCategory) return

    const fetchData = async () => {
      try {
        setIsLoadingData(true)
        const res = await fetch(`/api/colleges/kcet/${collegeCode}/cutoff-vs-year?course_code=${selectedCourse}&cat=${selectedCategory}`)
        if (!res.ok) throw new Error("Failed to fetch cutoff data")
        const data = await res.json()
        setCutoffData(data.colleges || [])
      } catch (err) {
        console.error(err)
        setCutoffData([])
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [collegeCode, selectedCourse, selectedCategory])

  const filteredData = useMemo(() => {
    if (selectedRound === "all") return cutoffData
    return cutoffData.filter((d) => d.round.toString() === selectedRound)
  }, [cutoffData, selectedRound])

  // For LineChart, we want data grouped by year: { year: 2021, 1: 5000, 2: 7000 }
  const formattedLineData = useMemo(() => {
    const yearMap = new Map<number, Record<string, number | string>>()
    
    filteredData.forEach(d => {
      if (!yearMap.has(d.year)) {
        yearMap.set(d.year, { year: d.year })
      }
      yearMap.get(d.year)![d.round.toString()] = d.rank
    })

    // Sort by year
    return Array.from(yearMap.values()).sort((a, b) => (a.year as number) - (b.year as number))
  }, [filteredData])

  const roundsInData: number[] = useMemo(() => {
    return Array.from(new Set(filteredData.map((d) => d.round))).sort((a, b) => a - b)
  }, [filteredData])

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold">Year-Wise Cutoff Trends</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Explore historical cutoffs across years, categories, and rounds.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={isLoadingCourses}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.course_code} value={c.course_code}>
                    {c.course_name.length > 20 ? c.course_name.slice(0, 20) + "..." : c.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRound} onValueChange={setSelectedRound}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                <SelectItem value="1">Round 1</SelectItem>
                <SelectItem value="2">Round 2</SelectItem>
                <SelectItem value="3">Round 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Loading data...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <TrendingDown className="h-12 w-12 mb-3 opacity-20" />
            No historical data available for these filters
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formattedLineData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                type="number" 
                dataKey="year" 
                name="Year" 
                domain={['dataMin', 'dataMax']} 
                tickCount={6}
                tickFormatter={(val) => Math.floor(val).toString()}
              />
              <YAxis 
                type="number" 
                name="Rank" 
                domain={['auto', 'auto']}
                tickFormatter={(val) => val.toLocaleString()}
                reversed={true}
              />
              <RechartsTooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md max-w-sm">
                      <p className="font-bold mb-2">Year {label}</p>
                      <div className="space-y-1 text-sm">
                        {payload.map((entry: { name: string; color: string; value: number }) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }} 
                            />
                            <p>
                              <strong className="text-muted-foreground">{entry.name}:</strong>{" "}
                              {entry.value.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }}
              />
              <Legend />
              {roundsInData.map(round => (
                <Line
                  key={round} 
                  type="monotone"
                  dataKey={round.toString()}
                  name={`Round ${round}`} 
                  stroke={ROUND_COLORS[round] || "#8884d8"}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
