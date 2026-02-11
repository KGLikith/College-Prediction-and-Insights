"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"

import { COURSE_NAME_TO_CODE, DISTRICT_CODE_TO_NAME } from "@/lib/types"

interface ResultsFilterProps {
  collegeCount: number
  initialValues: {
    search: string
    course: string
    chances: string
    round: string
    district: string
  }
  onApplyFilters: (filters: {
    search: string
    course: string
    chances: string
    round: string
    district: string
  }) => void
  onClearFilters: () => void
}

export function ResultsFilter({
  collegeCount,
  initialValues,
  onApplyFilters,
  onClearFilters,
}: ResultsFilterProps) {

  const [search, setSearch] = useState(initialValues.search)
  const [course, setCourse] = useState(initialValues.course || "all")
  const [chances, setChances] = useState(initialValues.chances || "all")
  const [round, setRound] = useState(initialValues.round || "all")
  const [district, setDistrict] = useState(initialValues.district || "ALL")

  useEffect(() => {
    setSearch(initialValues.search)
    setCourse(initialValues.course)
    setChances(initialValues.chances)
    setRound(initialValues.round)
    setDistrict(initialValues.district)
  }, [initialValues])

  const availableCourses = useMemo(
    () => Object.keys(COURSE_NAME_TO_CODE),
    []
  )

  const hasActiveFilters =
    search !== "" ||
    course !== "all" ||
    chances !== "all" ||
    round !== "all" ||
    district !== "ALL"

  const handleApply = () => {
    onApplyFilters({
      search,
      course,
      chances,
      round,
      district,
    })
  }

  const handleClear = () => {
    setSearch("")
    setCourse("all")
    setChances("all")
    setRound("all")
    setDistrict("ALL")

    onClearFilters()
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 space-y-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2 font-semibold text-sm">
            <Filter className="h-5 w-5 text-primary" />
            Filters
            <span className="text-muted-foreground font-normal">
              ({collegeCount})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              Clear
            </Button>

            <Button
              size="sm"
              onClick={handleApply}
            >
              Apply Filters
            </Button>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search college..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Course
            </label>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {availableCourses.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              District
            </label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISTRICT_CODE_TO_NAME).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Chances
            </label>
            <Select value={chances} onValueChange={setChances}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Round
            </label>
            <Select value={round} onValueChange={setRound}>
              <SelectTrigger className="h-10">
                <SelectValue />
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

      </CardContent>
    </Card>

  )
}
