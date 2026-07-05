"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts"
import { getCourseCode } from "@/lib/types"
import { Users, Filter } from "lucide-react"
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

export default function QuotasAnalyticsPage() {
  const [data, setData] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<{code: string, name: string}[]>([])
  const [loading, setLoading] = useState(true)

  const [colleges, setColleges] = useState<{id: string, name: string}[]>([])
  const [selectedCollegeId, setSelectedCollegeId] = useState("E005")
  const [selectedCourse, setSelectedCourse] = useState("CS")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const baseUrl = ""
        
        if (colleges.length === 0) {
          const rankingRes = await axios.get(`${baseUrl}/api/colleges/kcet?limit=250`)
          setColleges(rankingRes.data.colleges.map((c:any) => ({ id: c.collegeID, name: c.collegeName.split(',')[0].replace('(AUTONOMOUS)', '').trim() })))
        }

        if (!selectedCollegeId) {
          setLoading(false)
          return
        }

        // Fetch cutoffs for ALL categories concurrently
        const promises = ALL_CATEGORIES.map(cat => 
           axios.get(`${baseUrl}/api/colleges/kcet/${selectedCollegeId}/cutoffs?cat=${cat}`)
                .then(res => ({ cat, data: res.data }))
                .catch(() => ({ cat, data: null }))
        )
        const responses = await Promise.all(promises)

        const courseSet = new Map<string, string>()
        const categoryDataMap = new Map<string, number>()

        responses.forEach((res) => {
          if (!res.data || !res.data.colleges || res.data.colleges.length === 0) return
          const list = res.data.colleges[0].CourseList
          
          list.forEach((course: any) => {
             const code = getCourseCode(course.courseName) || course.courseName.substring(0, 4)
             courseSet.set(code, course.courseName)
             
             if (code === selectedCourse) {
                 categoryDataMap.set(res.cat, course.minRank)
             }
          })
        })

        const uniqueAvail = Array.from(courseSet.entries()).map(([code, name]) => ({code, name}))
        uniqueAvail.sort((a, b) => a.code.localeCompare(b.code))
        setAvailableCourses(uniqueAvail)

        const chartData = Array.from(categoryDataMap.entries())
            .map(([category, rank]) => ({ category, rank }))
            .sort((a, b) => a.rank - b.rank) // Sort by hardest to easiest

        setData(chartData)
      } catch (error) {
        console.error("Failed to fetch quotas data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCollegeId, selectedCourse])

  const gmRank = data.find(d => d.category === "GM")?.rank || 0
  const easiestCat = data[data.length - 1]
  const maxRelaxation = easiestCat && gmRank ? easiestCat.rank - gmRank : 0

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-500" />
          Quota Analytics
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Analyze cutoff requirements across all reservation categories for a specific branch.
        </p>
      </div>

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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightTile 
          title="General Merit (GM) Cutoff"
          value={`Rank ${gmRank}`}
          meaning="The unreserved baseline cutoff rank."
          calculation="Direct historical cutoff for GM."
          interpretation="Used as the baseline to calculate category relaxation."
        />
        <InsightTile 
          title="Max Relaxation Bracket"
          value={easiestCat ? easiestCat.category : "N/A"}
          meaning="The category that gets the most rank relaxation for this specific branch."
          calculation="The category with the highest numerical rank."
          interpretation={`Applicants in ${easiestCat?.category || 'this category'} have the easiest entry path.`}
        />
        <InsightTile 
          title="Maximum Rank Gain"
          value={`+${maxRelaxation} Ranks`}
          meaning="The total relaxation difference between GM and the easiest category."
          calculation="(Max Category Rank) - (GM Rank)."
          interpretation="Quantifies the sheer advantage provided by the most relaxed quota."
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Quota Rank Spectrum</h3>
          </div>
          <div className="h-[450px] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">Loading API data across all categories...</div>
            ) : data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'var(--tw-prose-body, white)', padding: '12px' }} formatter={(val: any) => [`Rank ${val}`]} />
                  <Bar name="Cutoff Rank" dataKey="rank" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.category === "GM" ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">No category data available for this branch.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
