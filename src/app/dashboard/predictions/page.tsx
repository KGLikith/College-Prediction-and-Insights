"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"

import { COURSE_NAME_TO_CODE, type APIResponse, type College } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

import { ResultsFilter } from "@/components/result-filter"
import { CollegeCard } from "@/components/college-card"
import { StatCard } from "@/components/StatCard"
import { ChanceDonutChart } from "@/components/charts/ChanceDonutChart"
import { RankComparisonChart } from "@/components/charts/RankComparisonChart"
import { TableSkeleton } from "@/components/LoadingSkeleton"
import { CollegeTable } from "@/components/tables/CollegeTable"

const getCourseCode = (courseName: string): string => {
  if (!courseName) return ""
  const upper = courseName.toUpperCase()
  if (Object.values(COURSE_NAME_TO_CODE).includes(upper as any)) return upper
  if (COURSE_NAME_TO_CODE[courseName as keyof typeof COURSE_NAME_TO_CODE])
    return COURSE_NAME_TO_CODE[courseName as keyof typeof COURSE_NAME_TO_CODE]
  return courseName.substring(0, 2).toUpperCase()
}

export default function PredictionsPage() {
  const [results, setResults] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(25)

  const searchParams = useSearchParams()
  const router = useRouter()

  const examType = (searchParams.get("exam") || "kcet") as
    | "kcet"
    | "comedk"
    | "jee"

  const userRank = searchParams.get("rank")
  const userCategory = searchParams.get("cat")

  const initialFilters = {
    search: searchParams.get("search") || "",
    course: searchParams.get("course") || "all",
    chances: searchParams.get("chances") || "all",
    round: searchParams.get("round") || "all",
    district: searchParams.get("district") || "ALL",
  }

  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()

        if (examType) queryParams.set("exam", examType)
        if (userRank) queryParams.set("rank", userRank)
        if (userCategory) queryParams.set("cat", userCategory)

        queryParams.set("page", page.toString())
        queryParams.set("limit", limit.toString())

        if (filters.search)
          queryParams.set("search", filters.search)

        if (filters.course !== "all")
          queryParams.set("course", getCourseCode(filters.course))

        if (filters.chances !== "all")
          queryParams.set("chances", filters.chances)

        if (filters.round !== "all")
          queryParams.set("round", filters.round)

        if (filters.district !== "ALL")
          queryParams.set("district", filters.district)

        router.replace(`?${queryParams.toString()}`, { scroll: false })

        const res = await axios.get(
          `/api/predictions/${examType}?${queryParams.toString()}`
        )

        setResults(res.data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch predictions.")
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [examType, page, limit, filters])


  const colleges: College[] = results?.colleges ?? []

  const filteredColleges = useMemo(() => {
    if (!filters.search) return colleges
    const q = filters.search.toLowerCase()
    return colleges.filter((c) =>
      c.collegeName.toLowerCase().includes(q)
    )
  }, [colleges, filters.search])

  const top3 = useMemo(
    () => filteredColleges.filter((c) => c.chances === "high").slice(0, 3),
    [filteredColleges]
  )

  const high = filteredColleges.filter((c) => c.chances === "high").length
  const medium = filteredColleges.filter((c) => c.chances === "medium").length
  const low = filteredColleges.filter((c) => c.chances === "low").length

  if (loading)
    return (
      <div className="flex justify-center py-32">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      </div>
    )

  if (error)
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto mt-8">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )

  if (!results || filteredColleges.length === 0)
    return (
      <Card className="max-w-3xl mx-auto mt-8">
        <CardContent className="py-16 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg">No predictions found</p>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 pt-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Search
        </Button>
        <div className="flex gap-3">
          {/* <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button> */}
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="bg-muted/50 border-2">
        <CardContent className="py-4 flex flex-wrap gap-6 font-medium">
          <div>Exam: <b>{examType.toUpperCase()}</b></div>
          <div>Rank: <b>{userRank}</b></div>
          <div>Category: <b>{userCategory}</b></div>
          <div>Predictions: <b>{filteredColleges.length}</b></div>
        </CardContent>
      </Card>

      {top3.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Top Matches</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {top3.map((c, i) => (
              <CollegeCard key={i} college={c} />
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <ChanceDonutChart colleges={filteredColleges} />
        <RankComparisonChart colleges={filteredColleges} />
      </div>

      <ResultsFilter
        collegeCount={filteredColleges.length}
        initialValues={filters}
        onApplyFilters={(newFilters) => {
          setPage(1)
          setFilters(newFilters)
        }}
        onClearFilters={() => {
          setPage(1)
          setFilters({
            search: "",
            course: "all",
            chances: "all",
            round: "all",
            district: "ALL",
          })
        }}
      />


      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <CollegeTable colleges={filteredColleges} title="All Predictions" />
          
          <div className="flex justify-center gap-4 mt-6">
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
        </>
      )}
    </div>
  )
}
