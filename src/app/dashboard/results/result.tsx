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
    collegeId: string
    course: string
    category: string
    chances: string
    round: number | null
    district: string
  }>({
    collegeId: searchParams.get("college-code") || searchParams.get("collegeId") || "",
    course: searchParams.get("course") || "all",
    category: searchParams.get("cat") || userCategory || "all",
    chances: searchParams.get("chances") || "all",
    round: searchParams.get("round") ? Number(searchParams.get("round")) : null,
    district: searchParams.get("district") || "ALL",
  })

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        searchParams.forEach((v, k) => {
          if (k !== "collegeId" && k !== "college-code" && k !== "course" && k !== "cat" && k !== "chances" && k !== "round" && k !== "district") {
             queryParams.append(k, v)
          }
        })
        
        if (filters.collegeId)
          queryParams.set("college-code", filters.collegeId)
        if (filters.course !== "all")
          queryParams.set("course", getCourseCode(filters.course))
        
        const selectedCategory = filters.category !== "all" ? filters.category : userCategory
        if (selectedCategory) queryParams.set("cat", selectedCategory)

        if (filters.chances !== "all")
          queryParams.set("chances", filters.chances)
        if (filters.round !== null)
          queryParams.set("round", filters.round.toString())
        if (filters.district !== "ALL")
          queryParams.set("district", filters.district)

        router.replace(`?${queryParams.toString()}`, { scroll: false })
        
        queryParams.set("page", page.toString())
        queryParams.set("limit", limit.toString())
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
    if (!filters.collegeId) return colleges
    return colleges.filter((c) => c.collegeID === filters.collegeId)
  }, [colleges, filters.collegeId])

  const top3 = useMemo(() => {
    return filteredColleges
      .filter((c) => c.chances === "high")
      .slice(0, 3)
  }, [filteredColleges])

  const high = filteredColleges.filter((c) => c.chances === "high").length
  const medium = filteredColleges.filter((c) => c.chances === "medium").length
  const low = filteredColleges.filter((c) => c.chances === "low").length

  if (loading)
    return (
      <div className="flex justify-center py-24 items-cen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )

  if (!results) return null

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-8 ">
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Search
        </Button>
        <div className="flex gap-2">
          {/* <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button> */}
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="py-3 flex gap-6 text-sm">
          <span>Exam: <b>{examType.toUpperCase()}</b></span>
          <span>Rank: <b>{userRank}</b></span>
          <span>Category: <b>{filters.category !== "all" ? filters.category : userCategory}</b></span>
          <span>Results: <b>{filteredColleges.length}</b></span>
        </CardContent>
      </Card>

      {filteredColleges.length > 0 && (
        <>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChanceDonutChart colleges={filteredColleges} />
            <RankComparisonChart colleges={filteredColleges} />
          </div>
        </>
      )}

      <ResultsFilter
        collegeCount={filteredColleges.length}
        initialValues={{
          collegeId: filters.collegeId,
          course: filters.course,
          category: filters.category,
          chances: filters.chances,
          round: filters.round ? filters.round.toString() : "all",
          district: filters.district,
        }}
        onApplyFilters={(newFilters) => {
          setPage(1)
          setFilters({
            collegeId: newFilters.collegeId,
            course: newFilters.course,
            category: newFilters.category,
            chances: newFilters.chances,
            round:
              newFilters.round === "all"
                ? null
                : Number(newFilters.round),
            district: newFilters.district,
          })
        }}
        onClearFilters={() => {
          setPage(1)
          setFilters({
            collegeId: "",
            course: "all",
            category: "all",
            chances: "all",
            round: null,
            district: "ALL",
          })
        }}
      />

      <div>
        {filteredColleges.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No matches for your filters</p>
              <p className="text-sm text-muted-foreground max-w-[300px] mt-2 mb-6">
                Try changing or clearing your filters to see more colleges.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setPage(1)
                  setFilters({
                    collegeId: "",
                    course: "all",
                    category: "all",
                    chances: "all",
                    round: null,
                    district: "ALL",
                  })
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <TableSkeleton />
        ) : (
          <CollegeTable colleges={filteredColleges} title="All Results" />
        )}

        {filteredColleges.length > 0 && (
          <div className="flex justify-center gap-4 mt-6 items-center mb-2">
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <span className="text-sm font-medium">Page {page}</span>
            <Button
              disabled={!results.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

    </div>
  )
}
