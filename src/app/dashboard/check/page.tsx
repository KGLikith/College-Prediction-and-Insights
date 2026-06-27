"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChanceBadge } from "@/components/ChanceBadge"
import { Disclaimer } from "@/components/disclaimer"
import {
  Loader2,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import type { College } from "@/lib/types"

const KCET_CATEGORIES = [
  "GM",
  "1G",
  "2AG",
  "2BG",
  "3AG",
  "3BG",
  "SCG",
  "STG",
  "KKR",
]

interface CollegeOption {
  collegeID: string
  collegeName: string
}

interface CourseOption {
  course_name: string
  course_code: string
}

const VERDICTS = {
  high: {
    Icon: CheckCircle2,
    tone: "text-emerald-600 dark:text-emerald-400",
    title: "High chance",
    message:
      "Based on the cutoff, you are likely to get this course at this college.",
  },
  medium: {
    Icon: AlertTriangle,
    tone: "text-amber-600 dark:text-amber-400",
    title: "Moderate chance",
    message:
      "This is borderline at your rank. Possible, but keep backup options ready.",
  },
  low: {
    Icon: XCircle,
    tone: "text-red-600 dark:text-red-400",
    title: "Low chance",
    message:
      "At this rank you are unlikely to get this course at this college.",
  },
} as const

export default function CourseCheckPage() {
  const router = useRouter()

  const [rank, setRank] = useState<number | "">("")
  const [category, setCategory] = useState("GM")
  const [round, setRound] = useState("all")
  const [hk, setHk] = useState(false)
  const [rural, setRural] = useState(false)
  const [kannada, setKannada] = useState(false)
  const [usePrediction, setUsePrediction] = useState(false)

  const [colleges, setColleges] = useState<CollegeOption[]>([])
  const [collegeId, setCollegeId] = useState("")
  const [collegeSearch, setCollegeSearch] = useState("")
  const [loadingColleges, setLoadingColleges] = useState(true)

  const [courses, setCourses] = useState<CourseOption[]>([])
  const [courseCode, setCourseCode] = useState("")
  const [loadingCourses, setLoadingCourses] = useState(false)

  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [match, setMatch] = useState<College | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true)
        const res = await fetch("/api/colleges/kcet")
        if (res.ok) {
          const data = await res.json()
          const unique = Array.from(
            new Map(
              (data?.colleges ?? []).map((c: CollegeOption) => [c.collegeID, c])
            ).values()
          ) as CollegeOption[]
          setColleges(unique)
        }
      } catch (err) {
        console.error("Failed to fetch colleges", err)
      } finally {
        setLoadingColleges(false)
      }
    }
    fetchColleges()
  }, [])

  useEffect(() => {
    if (!collegeId) {
      setCourses([])
      setCourseCode("")
      return
    }
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true)
        setCourseCode("")
        const res = await fetch(`/api/colleges/kcet/${collegeId}/course-codes`)
        if (res.ok) {
          const data = await res.json()
          setCourses(data?.colleges?.[0]?.CourseList ?? [])
        }
      } catch (err) {
        console.error("Failed to fetch courses", err)
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [collegeId])

  const filteredColleges = useMemo(() => {
    if (!collegeSearch) return colleges
    return colleges.filter((c) =>
      `${c.collegeName} ${c.collegeID}`
        .toLowerCase()
        .includes(collegeSearch.toLowerCase())
    )
  }, [colleges, collegeSearch])

  const selectedCollege = colleges.find((c) => c.collegeID === collegeId)

  const handleCheck = async () => {
    setError(null)

    if (!rank || rank < 1) {
      setError("Please enter a valid rank.")
      return
    }
    if (!collegeId) {
      setError("Please select a college.")
      return
    }
    if (!courseCode) {
      setError("Please select a course.")
      return
    }

    try {
      setIsChecking(true)
      setChecked(false)
      setMatch(null)

      const params = new URLSearchParams()
      params.set("rank", String(rank))
      params.set("cat", category)
      params.set("college-code", collegeId)
      params.set("course", courseCode)
      if (round !== "all") params.set("round", round)
      if (hk) params.set("hk", "true")
      if (rural) params.set("rural", "true")
      if (kannada) params.set("kannada", "true")

      const basePath = usePrediction ? "/api/predictions" : "/api/exams"
      const res = await axios.get(`${basePath}/kcet?${params.toString()}`)
      const rows: College[] = res.data?.colleges ?? []

      const candidates =
        round !== "all"
          ? rows.filter((r) => String(r.round) === round)
          : rows

      // Sort logic: 
      // 1. Chances: High > Medium > Low
      // 2. Round: 1 > 2 > 3
      const chancePriority = { high: 3, medium: 2, low: 1 }
      
      const sorted = [...candidates].sort((a, b) => {
        const pA = chancePriority[a.chances] || 0
        const pB = chancePriority[b.chances] || 0
        
        if (pA !== pB) return pB - pA // Higher priority first
        return a.round - b.round // Earlier round first
      })

      const best = sorted[0] ?? null

      setMatch(best)
      setChecked(true)
    } catch (err) {
      console.error(err)
      setError("Couldn't check this combination right now. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          Course Check
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          See whether you&apos;re likely to get a specific course at a specific
          college for your rank and category.
        </p>
      </div>

      <Card className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <CardHeader className="text-center border-b border-neutral-200 dark:border-neutral-800">
          <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Check a College &amp; Course
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            Enter your details and pick the exact college and course
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label className="mb-2 block text-neutral-700 dark:text-neutral-300 font-medium">
                Rank <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                placeholder="Your rank"
                value={rank}
                onChange={(e) =>
                  setRank(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label className="mb-2 block text-neutral-700 dark:text-neutral-300 font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {KCET_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-neutral-700 dark:text-neutral-300 font-medium">
                Round
              </Label>
              <Select value={round} onValueChange={setRound}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">Round 1</SelectItem>
                  <SelectItem value="2">Round 2</SelectItem>
                  <SelectItem value="3">Round 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="mb-2 block text-neutral-700 dark:text-neutral-300 font-medium">
                College <span className="text-destructive">*</span>
              </Label>
              <Select value={collegeId} onValueChange={setCollegeId}>
                <SelectTrigger className="w-full">
                  {loadingColleges ? (
                    <span className="text-muted-foreground">
                      Loading colleges...
                    </span>
                  ) : (
                    <span className="truncate text-left">
                      {selectedCollege
                        ? selectedCollege.collegeName
                        : "Select a college"}
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent className="w-[420px]">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Search college..."
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[260px] overflow-y-auto scrollbar-none">
                    {filteredColleges.map((c) => (
                      <SelectItem
                        key={c.collegeID}
                        value={c.collegeID}
                        className="py-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{c.collegeName}</span>
                          <span className="text-xs text-muted-foreground">
                            {c.collegeID}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-neutral-700 dark:text-neutral-300 font-medium">
                Course <span className="text-destructive">*</span>
              </Label>
              <Select
                value={courseCode}
                onValueChange={setCourseCode}
                disabled={!collegeId || loadingCourses}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !collegeId
                        ? "Select a college first"
                        : loadingCourses
                        ? "Loading courses..."
                        : "Select a course"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {courses.map((c) => (
                    <SelectItem key={c.course_code} value={c.course_code}>
                      {c.course_name} ({c.course_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={hk} onCheckedChange={(v) => setHk(!!v)} />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                HK
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={rural} onCheckedChange={(v) => setRural(!!v)} />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Rural
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={kannada}
                onCheckedChange={(v) => setKannada(!!v)}
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Kannada
              </span>
            </label>
          </div>

          <div className="flex items-center gap-4 justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-5 py-4 bg-neutral-100 dark:bg-neutral-800">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                ML-based Prediction
              </p>
              <p className="text-xs text-neutral-500">
                Use predictive cutoff estimation
              </p>
            </div>
            <Checkbox
              checked={usePrediction}
              onCheckedChange={(v) => setUsePrediction(Boolean(v))}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center pt-2">
            <Button
              size="lg"
              disabled={isChecking}
              onClick={handleCheck}
              className="bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold px-12 h-12"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Check
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {checked && (
        <div className="mt-8 space-y-6">
          {match ? (
            (() => {
              const verdict = VERDICTS[match.chances]
              const { Icon } = verdict
              return (
                <Card className="border-2">
                  <CardContent className="pt-6 space-y-5">
                    <div className="flex items-start gap-4">
                      <Icon className={`h-10 w-10 shrink-0 ${verdict.tone}`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                            {verdict.title}
                          </h2>
                          <ChanceBadge chance={match.chances} />
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {verdict.message}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t pt-5 text-sm">
                      <div>
                        <p className="text-muted-foreground">Your Rank</p>
                        <p className="font-semibold">
                          {Number(rank).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cutoff Rank</p>
                        <p className="font-semibold">
                          {match.cutoffRank.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-semibold">{match.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Round</p>
                        <p className="font-semibold">{match.round}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Course</p>
                        <p className="font-semibold">{match.course}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <p className="text-muted-foreground">College</p>
                        <p className="font-semibold">{match.collegeName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })()
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-lg font-medium">No cutoff data found</p>
                <p className="text-sm text-muted-foreground max-w-[340px] mt-2">
                  We don&apos;t have data for this course at this college for the
                  selected category and round. Try a different round or category.
                </p>
              </CardContent>
            </Card>
          )}

          <Disclaimer variant={usePrediction ? "statistical" : "cutoff"} />

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}