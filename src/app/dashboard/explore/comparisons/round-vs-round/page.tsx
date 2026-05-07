"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { getCourseCode } from "@/lib/types"
import { Layers, Filter } from "lucide-react"
import { SearchableCollegeSelect } from "../components/searchable-college-select"
import { InsightTile } from "../components/insight-tile"

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

export default function RoundsAnalyticsPage() {
  const [data, setData] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<{code: string, name: string}[]>([])
  const [loading, setLoading] = useState(true)

  const [colleges, setColleges] = useState<{id: string, name: string}[]>([])
  const [selectedCollegeId, setSelectedCollegeId] = useState("E005")
  const [selectedCourse, setSelectedCourse] = useState("CS")
  const [selectedCategory, setSelectedCategory] = useState("GM")

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
          axios.get(`${baseUrl}/api/colleges/kcet/${selectedCollegeId}/cutoff-vs-year?course_code=${selectedCourse}&cat=${selectedCategory}`).catch(() => null),
          axios.get(`${baseUrl}/api/colleges/kcet/${selectedCollegeId}/cutoffs?cat=${selectedCategory}`).catch(() => null)
        ])

        if (cutoffsRes?.data?.colleges && cutoffsRes.data.colleges.length > 0) {
           const avail = cutoffsRes.data.colleges[0].CourseList.map((course: any) => {
             const code = getCourseCode(course.courseName) || course.courseName.substring(0, 4)
             return { code, name: course.courseName }
           })
           const uniqueAvail = Array.from(new Map(avail.map((item: any) => [item.code, item])).values()) as {code: string, name: string}[]
           uniqueAvail.sort((a, b) => a.code.localeCompare(b.code))
           setAvailableCourses(uniqueAvail)
        }
        
        const yearDataMap = new Map<number, any>()
        
        if (historyRes?.data?.colleges) {
           historyRes.data.colleges.forEach((c: any) => {
              const yearObj = yearDataMap.get(c.year) || { year: c.year.toString() }
              yearObj[`Round ${c.round}`] = c.rank
              yearDataMap.set(c.year, yearObj)
           })
        }

        const chartData = Array.from(yearDataMap.values()).sort((a, b) => parseInt(a.year) - parseInt(b.year))
        
        // Fill missing rounds so lines are continuous
        chartData.forEach(yearObj => {
           if (yearObj['Round 1'] && !yearObj['Round 2']) yearObj['Round 2'] = yearObj['Round 1']
           if (yearObj['Round 2'] && !yearObj['Round 3']) yearObj['Round 3'] = yearObj['Round 2']
        })

        setData(chartData)
      } catch (error) {
        console.error("Failed to fetch rounds data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCollegeId, selectedCourse, selectedCategory])

  // Metric Calculations
  const latestYearData = data[data.length - 1]
  
  const validR1R2Data = data.filter(d => d['Round 1'] && d['Round 2'])
  const avgDropR1toR2 = validR1R2Data.length > 0 
    ? Math.round(validR1R2Data.reduce((acc, curr) => acc + (curr['Round 2'] - curr['Round 1']), 0) / validR1R2Data.length) 
    : 0

  const validR2R3Data = data.filter(d => (d['Round 2'] || d['Round 1']) && d['Round 3'])
  const avgDropR2toR3 = validR2R3Data.length > 0 
    ? Math.round(validR2R3Data.reduce((acc, curr) => acc + (curr['Round 3'] - (curr['Round 2'] || curr['Round 1'])), 0) / validR2R3Data.length) 
    : 0

  const getValidStartRank = (d: any) => d['Round 1'] || d['Round 2'] || d['Round 3'] || 0
  const getValidEndRank = (d: any) => d['Round 3'] || d['Round 2'] || d['Round 1'] || 0
  const maxLateRoundGain = latestYearData ? getValidEndRank(latestYearData) - getValidStartRank(latestYearData) : 0

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Layers className="h-6 w-6 text-pink-500" />
          Round vs Round
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Analyze admission round behavior over the years to detect late-round rank relaxation and opportunities.
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
          title="Avg Round 2 Relaxation"
          value={`+${avgDropR1toR2} Ranks`}
          meaning="How much the cutoff rank usually increases (relaxes) from Round 1 to Round 2."
          calculation="Historical average difference between Round 1 and Round 2."
          interpretation="Higher numbers mean waiting for Round 2 is generally a safe and rewarding bet."
        />
        <InsightTile 
          title="Avg Round 3 Relaxation"
          value={`+${avgDropR2toR3} Ranks`}
          meaning="How much the cutoff rank usually increases from Round 2 to Round 3."
          calculation="Historical average difference between Round 2 and Round 3."
          interpretation="Round 3 (Extended Round) can be unpredictable, but high numbers indicate hidden opportunities."
        />
        <InsightTile 
          title="Latest Year Late-Round Gain"
          value={`+${maxLateRoundGain} Ranks`}
          meaning="The total rank relaxation from Round 1 to the Final Round in the most recent year."
          calculation="(Final Round Rank) - (Round 1 Rank) for the latest available year."
          interpretation="Shows exactly how much patience paid off last year."
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Round Progression Line Chart */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50 lg:col-span-2">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Historical Round-by-Round Trajectory</h3>
          </div>
          <div className="h-[400px] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">Loading API data...</div>
            ) : data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis reversed tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'var(--tw-prose-body, white)', padding: '12px' }} formatter={(val: any) => [`Rank ${val}`]} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                  <Line type="monotone" name="Round 1 Cutoff" dataKey="Round 1" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Round 2 Cutoff" dataKey="Round 2" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" name="Round 3 Cutoff" dataKey="Round 3" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">No round data available for this selection.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
