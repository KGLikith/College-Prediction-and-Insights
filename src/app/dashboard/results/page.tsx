"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"

import {
  COURSE_NAME_TO_CODE,
  type APIResponse,
  type College,
} from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  Building2,
  Award,
  Target,
  TrendingUp,
} from "lucide-react"

import { StatCard } from "@/components/StatCard"
import { ChanceDonutChart } from "@/components/charts/ChanceDonutChart"
import { RankComparisonChart } from "@/components/charts/RankComparisonChart"
import { CollegeCard } from "@/components/college-card"
import { CollegeTable } from "@/components/tables/CollegeTable"
import { TableSkeleton } from "@/components/LoadingSkeleton"
import { ResultsFilter } from "@/components/result-filter"

/* ---------- helper ---------- */
const getCourseCode = (courseName: string): string => {
  if (!courseName) return ""
  const upper = courseName.toUpperCase()
  if (Object.values(COURSE_NAME_TO_CODE).includes(upper as any)) return upper
  if (COURSE_NAME_TO_CODE[courseName as keyof typeof COURSE_NAME_TO_CODE])
    return COURSE_NAME_TO_CODE[courseName as keyof typeof COURSE_NAME_TO_CODE]

  const lower = courseName.toLowerCase()
  if (lower.includes("data science")) return "DS"
  if (lower.includes("artificial")) return "AI"
  if (lower.includes("cyber")) return "CY"
  if (lower.includes("computer")) return "CS"
  if (lower.includes("electronics")) return "EC"
  if (lower.includes("information")) return "IT"
  if (lower.includes("mechanical")) return "ME"
  if (lower.includes("electrical")) return "EE"
  if (lower.includes("civil")) return "CV"
  if (lower.includes("bio")) return "BT"
  return courseName.substring(0, 2).toUpperCase()
}

export default function FlatResults() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const examType = (searchParams.get("exam") || "kcet") as
    | "kcet"
    | "comedk"
    | "jee"
  const userRank = searchParams.get("rank")
  const userCategory = searchParams.get("cat")

  const [results, setResults] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [limit] = useState(25)

  const [filters, setFilters] = useState<{
    search: string
    course: string
    chances: string
    round: number | null
    district: string
  }>({
    search: "",
    course: "all",
    chances: "all",
    round: null,
    district: "ALL"
  })

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        searchParams.forEach((v, k) => queryParams.append(k, v))
        queryParams.set("page", page.toString())
        queryParams.set("limit", limit.toString())

        if (filters.course !== "all")
          queryParams.set("course", getCourseCode(filters.course))
        if (filters.chances !== "all")
          queryParams.set("chances", filters.chances)
        if (filters.round !== null)
          queryParams.set("round", filters.round.toString())
        if (filters.district !== "ALL")
          queryParams.set("district", filters.district)

        router.replace(`?${queryParams.toString()}`, { scroll: false })

        const res = await axios.get(
          `/api/exams/${examType}?${queryParams.toString()}`
        )
        setResults(res.data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch results")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [examType, page, limit, filters, searchParams, router])

  const colleges: College[] = results?.colleges ?? []

  const filteredColleges = useMemo(() => {
    if (!filters.search) return colleges
    const q = filters.search.toLowerCase()
    return colleges.filter((c) =>
      c.collegeName.toLowerCase().includes(q)
    )
  }, [colleges, filters.search])

  /* ---------- TOP 3 ---------- */
  const top3 = useMemo(() => {
    return filteredColleges
      .filter((c) => c.chances === "high")
      .slice(0, 3)
  }, [filteredColleges])

  /* ---------- STATS ---------- */
  const high = filteredColleges.filter((c) => c.chances === "high").length
  const medium = filteredColleges.filter((c) => c.chances === "medium").length
  const low = filteredColleges.filter((c) => c.chances === "low").length

  /* ---------- STATES ---------- */
  if (loading)
    return (
      <div className="flex justify-center py-24">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )

  if (!results || colleges.length === 0)
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p>No results found</p>
        </CardContent>
      </Card>
    )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Search
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* META */}
      <Card className="bg-muted/30">
        <CardContent className="py-3 flex gap-6 text-sm">
          <span>Exam: <b>{examType.toUpperCase()}</b></span>
          <span>Rank: <b>{userRank}</b></span>
          <span>Category: <b>{userCategory}</b></span>
          <span>Results: <b>{filteredColleges.length}</b></span>
        </CardContent>
      </Card>

      {top3.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Top Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((c, i) => (
              <CollegeCard key={i} college={c} />
            ))}
          </div>
        </section>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Colleges" value={filteredColleges.length} icon={Building2} />
        <StatCard title="High Chance" value={high} icon={Award} />
        <StatCard title="Medium Chance" value={medium} icon={Target} />
        <StatCard title="Low Chance" value={low} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChanceDonutChart colleges={filteredColleges} />
        <RankComparisonChart colleges={filteredColleges} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ResultsFilter
          collegeCount={filteredColleges.length}
          onSearchChange={(v: string) =>
            setFilters((f) => ({ ...f, search: v }))
          }
          onCourseFilter={(v: string) =>
            setFilters((f) => ({ ...f, course: v }))
          }
          onChancesFilter={(v: string) =>
            setFilters((f) => ({ ...f, chances: v }))
          }
          onRoundFilter={(v: string) =>
            setFilters((f) => ({
              ...f,
              round: v === "all" ? null : Number(v),
            }))
          }
          onDistrictFilter={(v) => setFilters((f) => ({ ...f, district: v }))}
          onClearFilters={() =>
            setFilters({
              search: "",
              course: "all",
              chances: "all",
              round: null,
              district: "ALL"
            })
          }
        />

        <div className="lg:col-span-4">
          {loading ? (
            <TableSkeleton />
          ) : (
            <CollegeTable colleges={filteredColleges} title="All Results" />
          )}

          <div className="flex justify-center gap-4 mt-4">
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <span>Page {page}</span>
            <Button
              disabled={!results.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
