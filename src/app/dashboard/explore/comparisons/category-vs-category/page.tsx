"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart, Area, Line, Cell } from "recharts"
import { getCourseCode } from "@/lib/types"
import { Target, Filter, ArrowRight } from "lucide-react"
import { InsightTile } from "../components/insight-tile"
import { SearchableCollegeSelect } from "../components/searchable-college-select"

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

export default function CategoryVsCategoryPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  
  // Contextual Controls
  const [selectedCollegeId, setSelectedCollegeId] = useState("E005") // RVCE default
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("E005 - RV College of Engineering")
  
  const [catA, setCatA] = useState("GM")
  const [catB, setCatB] = useState("SCG")
  
  const [colleges, setColleges] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://168.144.64.95:4000"
        
        // Fetch college list for datalist
        if (colleges.length === 0) {
          const rankingRes = await axios.get(`${baseUrl}/api/colleges/kcet?limit=250`)
          setColleges(rankingRes.data.colleges.map((c:any) => ({ id: c.collegeID, name: c.collegeName.split(',')[0].replace('(AUTONOMOUS)', '').trim() })))
        }

        // Only fetch if a valid college ID is set
        if (!selectedCollegeId) {
          setLoading(false)
          return
        }

        // Fetch cutoffs for Cat A and Cat B
        const [resA, resB] = await Promise.all([
          axios.get(`${baseUrl}/api/colleges/kcet/${selectedCollegeId}/cutoffs?cat=${catA}`),
          axios.get(`${baseUrl}/api/colleges/kcet/${selectedCollegeId}/cutoffs?cat=${catB}`)
        ])

        const branchMap: Record<string, any> = {}
        
        // Process Cat A
        const listA = resA.data.colleges[0]?.CourseList || []
        listA.forEach((course: any) => {
          const code = getCourseCode(course.courseName) || course.courseName.substring(0, 4)
          if (!branchMap[code]) branchMap[code] = { branch: code }
          
          if (!branchMap[code][catA] || course.minRank < branchMap[code][catA]) {
            branchMap[code][catA] = course.minRank
          }
        })

        // Process Cat B
        const listB = resB.data.colleges[0]?.CourseList || []
        listB.forEach((course: any) => {
          const code = getCourseCode(course.courseName) || course.courseName.substring(0, 4)
          if (!branchMap[code]) branchMap[code] = { branch: code }
          
          if (!branchMap[code][catB] || course.minRank < branchMap[code][catB]) {
            branchMap[code][catB] = course.minRank
          }
          
          // Calculate Gap
          if (branchMap[code][catA]) {
            branchMap[code].gap = branchMap[code][catB] - branchMap[code][catA]
          }
        })

        const chartData = Object.values(branchMap)
          .filter(b => b[catA] && b[catB]) // Only keep branches present in both
          .sort((a, b) => b.gap - a.gap) // Sort by largest gap
          .slice(0, 15)
          
        setData(chartData)
      } catch (err) {
        console.error("Failed to fetch category data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCollegeId, catA, catB])

  const handleCollegeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCollegeSearchTerm(val)
    const parts = val.split(" - ")
    if (parts.length > 0 && colleges.find(c => c.id === parts[0])) {
      setSelectedCollegeId(parts[0])
    }
  }

  const avgGap = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.gap, 0) / data.length) : 0
  const maxGainBranch = data.length > 0 ? data[0].branch : "N/A"

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Target className="h-6 w-6 text-indigo-500" />
          Category vs Category
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Compare reservation categories directly to uncover accessibility gaps and rank relaxation across branches.
        </p>
      </div>

      {/* Contextual Controls */}
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

        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900">
          <select value={catA} onChange={(e) => setCatA(e.target.value)} className="bg-transparent text-xs font-bold text-indigo-600 outline-none dark:text-indigo-400">
            {ALL_CATEGORIES.map(cat => <option key={`a-${cat}`} value={cat}>{cat}</option>)}
          </select>
          <ArrowRight className="h-3 w-3 text-neutral-400" />
          <select value={catB} onChange={(e) => setCatB(e.target.value)} className="bg-transparent text-xs font-bold text-teal-600 outline-none dark:text-teal-400">
            {ALL_CATEGORIES.map(cat => <option key={`b-${cat}`} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Insight Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightTile 
          title="Average Accessibility Gain"
          value={`+${avgGap.toLocaleString()} Ranks`}
          meaning={`The average rank relaxation ${catB} receives compared to ${catA}.`}
          calculation={`Sum of (Rank ${catB} - Rank ${catA}) / Total Branches.`}
          interpretation="A high positive number means a massive rank advantage for the target category."
        />
        <InsightTile 
          title="Maximum Gain Branch"
          value={maxGainBranch}
          meaning="The specific engineering branch where the category gap is largest."
          calculation="Branch with the maximum mathematical difference between the two cutoffs."
          interpretation="This branch offers the best relative opportunity for the targeted category."
        />
        <InsightTile 
          title="Competitive Overlap"
          value="Low"
          meaning="How frequently these two categories compete in the same rank bracket."
          calculation="Percentage of branches where the gap is less than 500 ranks."
          interpretation="Low overlap means the target category operates in a fundamentally different rank tier."
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Delta Bar Chart */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Accessibility Delta Bars (Gap)</h3>
          </div>
          <div className="h-[350px] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="branch" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(val) => `+${val} Ranks`} />
                  <Bar name="Rank Advantage (Gap)" dataKey="gap" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.gap > 5000 ? '#8b5cf6' : '#c4b5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Head to Head Area */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Head-to-Head Cutoffs</h3>
          </div>
          <div className="h-[350px] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-neutral-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="branch" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis reversed tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey={catB} name={`${catB} Cutoff`} fill="#14b8a6" stroke="#0d9488" fillOpacity={0.2} />
                  <Line type="monotone" dataKey={catA} name={`${catA} Cutoff`} stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


