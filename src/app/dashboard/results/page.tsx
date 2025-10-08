"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { type APIResponse, getCourseCode } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, Share2, RefreshCw, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ResultsFilter } from "@/components/result-filter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type College = APIResponse["colleges"][number]

type CourseEntry = {
  round: number
  cutoffRank: number
}

type CourseGroup = {
  courseName: string
  entries: CourseEntry[]
}

type CollegeCategoryGroup = {
  collegeID: string
  collegeName: string
  category: string
  courses: CourseGroup[]
}

export default function Results() {
  const [results, setResults] = useState<APIResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [roundFilter, setRoundFilter] = useState("all") 
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const storedResults = sessionStorage.getItem("predictionResults")
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    } else {
      router.push("/dashboard")
    }
  }, [router])

  const examType = (searchParams.get("exam") || "kcet") as "kcet" | "comedk" | "jee"
  const userRank = searchParams.get("rank")
  const userCategory = searchParams.get("cat")
  const initialCourse = searchParams.get("course") 
  const initialRound = searchParams.get("round") 

  const filteredColleges = useMemo(() => {
    if (!results?.colleges) return []
    return results.colleges.filter((college) => {
      const matchesSearch = college.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
      const courseCode = getCourseCode(college.course)
      const matchesCourse = courseFilter === "all" || courseCode === courseFilter
      const matchesRound = roundFilter === "all" || String(college.round) === String(roundFilter)
      return matchesSearch && matchesCourse && matchesRound
    })
  }, [results?.colleges, searchTerm, courseFilter, roundFilter])

  const grouped = useMemo<CollegeCategoryGroup[]>(() => {
    const map = new Map<
      string,
      { id: string; collegeName: string; category: string; courses: Map<string, CourseEntry[]> }
    >()
    filteredColleges.forEach((c) => {
      const key = `${c.collegeName}||${c.category}`
      if (!map.has(key)) {
        map.set(key, { id: c.collegeID, collegeName: c.collegeName, category: c.category, courses: new Map() })
      }
      const bucket = map.get(key)!
      const courseGroup = bucket.courses.get(c.course) ?? []
      courseGroup.push({ round: c.round, cutoffRank: c.cutoffRank })
      bucket.courses.set(c.course, courseGroup)
    })

    return Array.from(map.values())
      .map((v) => ({
        collegeID: v.id,
        collegeName: v.collegeName.split(",")[0].trim(),
        category: v.category,
        courses: Array.from(v.courses.entries()).map(([courseName, entries]) => ({
          courseName,
          entries: entries.sort((a, b) => b.round - a.round),
        })),
      }))
      .sort((a, b) => a.collegeName.localeCompare(b.collegeName))
  }, [filteredColleges])

  const handleDownload = () => {
    if (!results?.colleges) return
    const csv = [
      ["College ID", "College Name", "Category", "Course", "Round", "Closing Rank"].join(","),
      ...results.colleges.map((college) =>
        [
          college.collegeID,
          `"${college.collegeName}"`,
          college.category,
          `"${college.course}"`,
          college.round,
          college.cutoffRank,
        ].join(","),
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `college-predictions-${examType}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "College Predictions",
          text: `Found ${filteredColleges.length || 0} colleges matching my criteria`,
          url: window.location.href,
        })
      } catch {
        /* no-op */
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your predictions...</p>
        </div>
      </div>
    )
  }

  if (results.status === "error") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{results.message || "Failed to get predictions. Please try again."}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          New Search
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Exam</span>
              <Badge variant="secondary">{examType.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rank</span>
              <span className="font-semibold">{userRank ? Number.parseInt(userRank).toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Category</span>
              <span className="font-semibold">{userCategory || "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <ResultsFilter
            onSearchChange={setSearchTerm}
            onCourseFilter={setCourseFilter}
            onRoundFilter={setRoundFilter}
            collegeCount={filteredColleges.length}
            colleges={results.colleges}
            examType={examType}
            initialCourse={initialCourse ? getCourseCode(initialCourse) : "all"}
            initialRound={initialRound || "all"}
            disableCourse={!!initialCourse}
            disableRound={!!initialRound}
          />
        </div>

        <div className="md:col-span-3 space-y-3">
          {grouped.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {grouped.map((g) => (
                <Card key={`${g.collegeID}-${g.collegeName}-${g.category}`} className="border-muted">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base leading-tight">{g.collegeName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{g.collegeID}</Badge>
                        <Badge variant="secondary">{g.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Round</TableHead>
                          <TableHead className="text-right">Closing Rank</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {g.courses.flatMap((course) =>
                          course.entries.map((e, idx) => (
                            <TableRow key={`${course.courseName}-${idx}`}>
                              <TableCell className="text-foreground">{course.courseName}</TableCell>
                              <TableCell>{`Round ${e.round}`}</TableCell>
                              <TableCell className="text-right font-medium">{e.cutoffRank.toLocaleString()}</TableCell>
                            </TableRow>
                          )),
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* <Card className="bg-muted/20">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> Predictions are based on historical data and trends. Actual cutoffs may
                vary. Verify with official sources.
              </p>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )
}
