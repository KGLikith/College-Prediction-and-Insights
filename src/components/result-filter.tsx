"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"
import { COURSE_CATEGORIES, getCourseCode } from "@/lib/types"

interface College {
  collegeID: string
  collegeName: string
  course: string
  category: string
  year: number
  round: number
  cutoffRank: number
  gmRank: number
}

interface ResultsFilterProps {
  onSearchChange: (search: string) => void
  onCourseFilter: (course: string) => void
  onRoundFilter?: (round: string) => void
  collegeCount: number
  colleges?: College[]
  examType?: "kcet" | "comedk" | "jee"
  initialCourse?: string
  initialRound?: string
  disableCourse?: boolean
  disableRound?: boolean
}

const ROUND_OPTIONS: Record<NonNullable<ResultsFilterProps["examType"]>, string[]> = {
  kcet: ["1", "2", "3"],
  comedk: ["1", "2", "3", "4"],
  jee: ["1", "2", "3", "4"],
}

export function ResultsFilter({
  onSearchChange,
  onCourseFilter,
  onRoundFilter,
  collegeCount,
  colleges = [],
  examType = "kcet",
  initialCourse = "all",
  initialRound = "all",
  disableCourse = false,
  disableRound = false,
}: ResultsFilterProps) {
  const [search, setSearch] = useState("")
  const [course, setCourse] = useState(initialCourse)
  const [round, setRound] = useState(initialRound)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  const handleCourseChange = (value: string) => {
    setCourse(value)
    onCourseFilter(value)
  }

  const handleRoundChange = (value: string) => {
    setRound(value)
    onRoundFilter?.(value)
  }

  const availableCourses = useMemo(() => {
    const courseSet = new Set<string>()
    colleges.forEach((college) => {
      const courseCode = getCourseCode(college.course)
      courseSet.add(courseCode)
    })
    return Array.from(courseSet).sort()
  }, [colleges])

  const rounds = ROUND_OPTIONS[examType] || []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
        <CardDescription>Found {collegeCount} entries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search Colleges
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Type college name..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Course</Label>
          <Select value={course} onValueChange={handleCourseChange} disabled={disableCourse}>
            <SelectTrigger>
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {availableCourses.map((code) => (
                <SelectItem key={code} value={code}>
                  {code} - {COURSE_CATEGORIES[code] || code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Round</Label>
          <Select value={round} onValueChange={handleRoundChange} disabled={disableRound}>
            <SelectTrigger>
              <SelectValue placeholder="All rounds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rounds</SelectItem>
              {rounds.map((r) => (
                <SelectItem key={r} value={r}>
                  Round {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
