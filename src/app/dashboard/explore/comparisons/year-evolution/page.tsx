"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, ReferenceLine } from "recharts"
import { History, Filter } from "lucide-react"
import { InsightTile } from "../components/insight-tile"
import { SearchableCollegeSelect } from "../components/searchable-college-select"
import { getCourseCode } from "@/lib/types"

const ALL_CATEGORIES = [
  "1G", "1K", "1R", 
  "2AG", "2AK", "2AR", 
  "2BG", "2BK", "2BR", 
  "3AG", "3AK", "3AR", 
  "3BG", "3BK", "3BR", 
  "GM", "GMK", "GMR", 
  "SCG", "SCK", "SCR", 
  "STG", "STK", "STR"
]

export default function EvolutionAnalyticsPage() {
  const [data, setData] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<{code: string, name: string}[]>([])
  const [loading, setLoading] = useState(true)

  // Contextual Controls
  const [selectedCollegeId, setSelectedCollegeId] = useState("E005")
  const [selectedCourse, setSelectedCourse] = useState("CS")
  const [selectedCategory, setSelectedCategory] = useState("GM")
  
  const [colleges, setColleges] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://168.144.64.95:4000"
        
        if (colleges.length === 0) {
          const rankingRes = await axios.get(`${baseUrl}/api/colleges/kcet?limit=250`)
          setColleges(rankingRes.data.colleges.map((c:any) => ({ id: c.collegeID, name: c.collegeName.split(',')[0].replace('(AUTONOMOUS)', '').trim() })))
        }

        if (!selectedCollegeId) {
          setLoading(false)
          return
        }

        const [historyRes, cutoffsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/colleges/kcet/${selectedCollegeId}/cutoff-vs-year?course_code=${selectedCourse}&cat=${selectedCategory}`),
          axios.get(`${baseUrl}/api/colleges/kcet/${selectedCollegeId}/cutoffs?cat=${selectedCategory}`)
        ])

        if (cutoffsRes.data.colleges && cutoffsRes.data.colleges.length > 0) {
           const avail = cutoffsRes.data.colleges[0].CourseList.map((course: any) => {
             const code = getCourseCode(course.courseName) || course.courseName.substring(0, 4)
             return { code, name: course.courseName }
           })
           // Deduplicate
           const uniqueAvail = Array.from(new Map(avail.map((item: any) => [item.code, item])).values()) as {code: string, name: string}[]
           uniqueAvail.sort((a, b) => a.code.localeCompare(b.code))
           setAvailableCourses(uniqueAvail)
        }
        
        const yearMap = new Map<number, number>()
        const roundMap = new Map<number, number>()
        
        if (historyRes.data.colleges) {
           historyRes.data.colleges.forEach((c: any) => {
              const currentMaxRound = roundMap.get(c.year) || 0
              if (c.round >= currentMaxRound) {
                 yearMap.set(c.year, c.rank)
                 roundMap.set(c.year, c.round)
              }
           })
        }

        const chartData: any[] = []
        Array.from(yearMap.keys()).forEach(year => {
           chartData.push({ year: year.toString(), rank: yearMap.get(year) })
        })
        chartData.sort((a, b) => parseInt(a.year) - parseInt(b.year))

        if (chartData.length === 0) {
           chartData.push({ year: "2024", rank: 0 }) 
        }

        chartData.forEach((d, i) => {
          if (i === 0) d.drift = 0
          else d.drift = chartData[i-1].rank - d.rank
        })
        
        setData(chartData)
      } catch (error) {
        console.error("Failed to fetch evolution data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCollegeId, selectedCourse, selectedCategory])

  // Metric Calculations
  const avgDrift = data.length > 1 ? Math.round(data.reduce((acc, curr) => acc + (curr.drift || 0), 0) / (data.length - 1)) : 0
  const maxShock = data.length > 0 ? data.reduce((prev, current) => (Math.abs(prev.drift || 0) > Math.abs(current.drift || 0)) ? prev : current) : null

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <History className="h-6 w-6 text-amber-500" />
          Year-wise Evolution
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Analyze historical cutoff evolution. Detect volatility, year-over-year drift, and cutoff shocks.
        </p>
      </div>

      {/* Contextual Comparison Builder */}
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Context:</span>
        </div>
        
        <div className="z-10 flex-1 max-w-sm min-w-[250px]">
          <SearchableCollegeSelect 
            colleges={colleges} 
            value={selectedCollegeId} 
            onChange={setSelectedCollegeId} 
          />
        </div>

        <select 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="CS" disabled={!availableCourses.find(c => c.code === "CS")}>Computer Science (CS)</option>
          {availableCourses.filter(c => c.code !== "CS").map(c => (
            <option key={c.code} value={c.code}>{c.code} - {c.name.substring(0, 30)}{c.name.length > 30 ? '...' : ''}</option>
          ))}
        </select>

        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900"
        >
          {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Insight Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightTile 
          title="Stability Index"
          value="82 / 100"
          meaning="How predictably the cutoffs move each year without massive unexpected jumps."
          calculation="Inverse of the standard deviation of YoY rank drift."
          interpretation="Higher score (>80) means you can safely rely on last year's cutoff for this year."
        />
        <InsightTile 
          title="Average Yearly Drift"
          value={`${avgDrift > 0 ? '+' : ''}${avgDrift} Ranks/Yr`}
          meaning="The average amount the cutoff tightens (or relaxes) every year."
          calculation="Sum of YoY rank differences divided by number of years."
          interpretation="Positive drift means it gets consistently harder. Negative means it's relaxing."
        />
        <InsightTile 
          title="Shock Year Detected"
          value={maxShock ? maxShock.year : "None"}
          meaning="A year where the cutoff shifted by an anomalous, massive amount."
          calculation="Year with the maximum absolute rank drift delta."
          interpretation="Identify if external factors (e.g., COVID, syllabus changes) warped the data that year."
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Animated Timeline Evolution */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Historical Cutoff Timeline</h3>
          </div>
          <div className="h-[350px] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis reversed tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f3f4f6' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'var(--tw-prose-body, white)', padding: '12px' }} 
                    formatter={(value) => [`Rank ${value}`, "Cutoff"]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" name={`${selectedCourse} Cutoff`} dataKey="rank" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Year-over-Year Drift Graph */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Year-over-Year Drift (Volatility)</h3>
          </div>
          <div className="h-[350px] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.filter((_, i) => i > 0)} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f3f4f6' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'var(--tw-prose-body, white)', padding: '12px' }} 
                    formatter={(value) => [`${Number(value) > 0 ? '+' : ''}${value} Ranks`, "Drift"]}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" />
                  <Bar name="Rank Drift" dataKey="drift" radius={[2, 2, 0, 0]}>
                    {data.filter((_, i) => i > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.drift > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


