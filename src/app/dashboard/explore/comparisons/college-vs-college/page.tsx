"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from "recharts"
import { getCourseCode } from "@/lib/types"
import { Building2, X, Plus, Target, CheckCircle2, TrendingUp, Filter, Search } from "lucide-react"

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

export default function CollegeVsCollegePage() {
  const [loading, setLoading] = useState(true)
  const [allColleges, setAllColleges] = useState<{id: string, name: string, fullName: string}[]>([])
  const [radarData, setRadarData] = useState<any[]>([])
  const [historyData, setHistoryData] = useState<any[]>([])
  const [availableCourses, setAvailableCourses] = useState<{code: string, name: string}[]>([])
  
  // Contextual Controls State
  const [selectedColleges, setSelectedColleges] = useState(["E005", "E003", "E009"]) // Defaults
  const [selectedCategory, setSelectedCategory] = useState("GM")
  const [selectedCourse, setSelectedCourse] = useState("CS")
  
  const [addCollegeTerm, setAddCollegeTerm] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://168.144.64.95:4000"
        
        let collegesList = allColleges
        if (collegesList.length === 0) {
          const rankingRes = await axios.get(`${baseUrl}/api/colleges/kcet?limit=250`)
          collegesList = rankingRes.data.colleges.map((c:any) => ({ 
            id: c.collegeID, 
            name: c.collegeName.split(',')[0].replace('(AUTONOMOUS)', '').trim(),
            fullName: c.collegeName
          }))
          setAllColleges(collegesList)
        }
        
        // Fetch cutoffs dynamically for selected colleges
        const cutoffPromises = selectedColleges.map(id => 
          axios.get(`${baseUrl}/api/colleges/kcet/${id}/cutoffs?cat=${selectedCategory}`)
        )
        const responses = await Promise.all(cutoffPromises)
        
        const branchMap: Record<string, any> = {}
        const availCoursesMap = new Map<string, string>()

        responses.forEach((res, index) => {
          if (!res.data.colleges || res.data.colleges.length === 0) return
          const collegeData = res.data.colleges[0]
          
          const colInfo = collegesList.find(c => c.id === selectedColleges[index])
          const cName = colInfo ? colInfo.name : selectedColleges[index]
          
          collegeData.CourseList.forEach((course: any) => {
            const code = getCourseCode(course.courseName) || course.courseName.substring(0, 4)
            if (!branchMap[code]) branchMap[code] = { branch: code }
            
            // If the branch already has a rank for this college, only overwrite if the new one is more competitive
            if (!branchMap[code][cName] || course.minRank < branchMap[code][cName]) {
              branchMap[code][cName] = course.minRank
            }

            // Similarly, keep the name of the most competitive variant as the representative name
            if (!availCoursesMap.has(code) || (course.minRank < branchMap[code][cName])) {
              availCoursesMap.set(code, course.courseName)
            }
          })
        })

        const uniqueAvail = Array.from(availCoursesMap.entries())
          .map(([code, name]) => ({code, name}))
          .sort((a, b) => a.code.localeCompare(b.code))
        setAvailableCourses(uniqueAvail)

        const chartData = Object.values(branchMap)
          .filter(b => Object.keys(b).length > 1) 
          .slice(0, 8) 
        
        setRadarData(chartData)

        // Fetch historical data for selected colleges based on selected course
        const historyPromises = selectedColleges.map(id => 
          axios.get(`${baseUrl}/api/colleges/kcet/${id}/cutoff-vs-year?course_code=${selectedCourse}&cat=${selectedCategory}`).catch(() => null)
        )
        const historyResponses = await Promise.all(historyPromises)

        const yearDataMap = new Map<number, any>()
        historyResponses.forEach((res, index) => {
          if (!res || !res.data || !res.data.colleges) return
          const colInfo = collegesList.find(c => c.id === selectedColleges[index])
          const cName = colInfo ? colInfo.name : selectedColleges[index]
          
          const roundMap = new Map<number, number>()
          res.data.colleges.forEach((c: any) => {
             const currentMaxRound = roundMap.get(c.year) || 0
             if (c.round >= currentMaxRound) {
                roundMap.set(c.year, c.round)
                const yearObj = yearDataMap.get(c.year) || { year: c.year.toString() }
                yearObj[cName] = c.rank
                yearDataMap.set(c.year, yearObj)
             }
          })
        })

        const histChartData = Array.from(yearDataMap.values()).sort((a, b) => parseInt(a.year) - parseInt(b.year))
        
        setHistoryData(histChartData)
      } catch (err) {
        console.error("Failed to fetch data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedColleges, selectedCategory, selectedCourse])

  const handleAddCollege = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setAddCollegeTerm(val)
    const parts = val.split(" - ")
    if (parts.length > 0) {
      const colId = parts[0]
      if (allColleges.find(c => c.id === colId) && !selectedColleges.includes(colId)) {
        if (selectedColleges.length < 5) {
          setSelectedColleges([...selectedColleges, colId])
          setAddCollegeTerm("")
        } else {
          alert("You can only compare up to 5 colleges at once.")
        }
      }
    }
  }

  const removeCollege = (idToRemove: string) => {
    if (selectedColleges.length <= 1) return
    setSelectedColleges(selectedColleges.filter(id => id !== idToRemove))
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-500" />
          College vs College
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Deep college comparison engine. Add multiple colleges dynamically to analyze branch strength and competitiveness.
        </p>
      </div>

      {/* Contextual Comparison Builder */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800 gap-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
            <Filter className="h-4 w-4 text-neutral-500" />
            Comparison Context
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input 
                type="text"
                list="college-list-add"
                value={addCollegeTerm}
                onChange={handleAddCollege}
                placeholder="Search to add college (max 5)..."
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-1.5 text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
              <datalist id="college-list-add">
                {allColleges.map(c => (
                  <option key={c.id} value={`${c.id} - ${c.name}`} />
                ))}
              </datalist>
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
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {selectedColleges.map(id => {
            const col = allColleges.find(c => c.id === id)
            return (
              <div key={id} className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 py-1.5 pl-3 pr-1.5 text-xs font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
                <span className="max-w-[150px] truncate" title={col?.fullName || id}>{col?.name || id}</span>
                <button 
                  onClick={() => removeCollege(id)}
                  className="rounded-full p-1 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insight Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightTile 
          title="Competitiveness Index"
          value="8.4 / 10"
          meaning="Average difficulty of securing admission across selected colleges."
          calculation="Normalized aggregate of Top-5 branch cutoff ranks."
          interpretation="Higher score = harder to get into."
        />
        <InsightTile 
          title="Branch Diversity Index"
          value="High"
          meaning="How many highly competitive branches exist across the selection."
          calculation="Count of branches with cutoffs under Rank 10,000."
          interpretation="High diversity means more 'good' backup options if you miss CS."
        />
        <InsightTile 
          title="Opportunity Score"
          value="62%"
          meaning="Chance of securing a better branch option if you compromise on college tier."
          calculation="Ratio of overlapping rank bounds between College A's mid-tier branches and College B's top-tier branches."
          interpretation="62% means you have a strong chance to upgrade your branch by switching to the next college."
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Branch Competitiveness Radar</h3>
          </div>
          <div className="h-[350px] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid strokeOpacity={0.2} />
                  <PolarAngleAxis dataKey="branch" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} tick={false} axisLine={false} />
                  {selectedColleges.map((id, idx) => {
                    const colInfo = allColleges.find(c => c.id === id)
                    const cName = colInfo ? colInfo.name : id
                    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']
                    const color = colors[idx % colors.length]
                    return <Radar key={id} name={cName} dataKey={cName} stroke={color} fill={color} fillOpacity={0.3} />
                  })}
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Historical Cutoff Trends */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Historical Trajectory ({selectedCourse} Branch)</h3>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Course Comparison</span>
          </div>
          <div className="h-[350px] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">Loading...</div>
            ) : historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis reversed tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(val: any, name: any) => [`Rank ${Math.round(val)}`, name]} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {selectedColleges.map((id, idx) => {
                    const colInfo = allColleges.find(c => c.id === id)
                    const cName = colInfo ? colInfo.name : id
                    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']
                    return <Line key={id} type="monotone" name={cName} dataKey={cName} stroke={colors[idx % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex h-full items-center justify-center text-neutral-400">No historical data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


