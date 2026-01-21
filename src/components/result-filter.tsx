"use client"

import { useMemo, useState } from "react"
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

import { COURSE_NAME_TO_CODE } from "@/lib/types"
import { DISTRICT_CODE_TO_NAME } from "@/lib/types"

interface ResultsFilterProps {
  collegeCount: number
  onSearchChange: (value: string) => void
  onCourseFilter: (value: string) => void
  onChancesFilter: (value: string) => void
  onRoundFilter: (value: string) => void
  onDistrictFilter: (value: string) => void
  onClearFilters: () => void
}

export function ResultsFilter({
  collegeCount,
  onSearchChange,
  onCourseFilter,
  onChancesFilter,
  onRoundFilter,
  onDistrictFilter,
  onClearFilters,
}: ResultsFilterProps) {
  const [search, setSearch] = useState("")
  const [course, setCourse] = useState("all")
  const [chances, setChances] = useState("all")
  const [round, setRound] = useState("all")
  const [district, setDistrict] = useState("ALL")

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

  const handleClear = () => {
    setSearch("")
    setCourse("all")
    setChances("all")
    setRound("all")
    setDistrict("ALL")

    onSearchChange("")
    onCourseFilter("all")
    onChancesFilter("all")
    onRoundFilter("all")
    onDistrictFilter("ALL")
    onClearFilters()
  }

  return (
    <Card className="border-2 shadow-md">
      <CardContent className="py-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* TITLE */}
          <div className="flex items-center gap-2 font-semibold">
            <Filter className="h-5 w-5 text-primary" />
            Filters
            <span className="text-muted-foreground font-normal">
              ({collegeCount})
            </span>
          </div>

          <div className="relative w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search college..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                onSearchChange(e.target.value)
              }}
              className="pl-10 h-10 border-2"
            />
          </div>

          <Select
            value={course}
            onValueChange={(v) => {
              setCourse(v)
              onCourseFilter(v)
            }}
          >
            <SelectTrigger className="w-[210px] h-10 border-2">
              <SelectValue placeholder="Course" />
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

          {/* DISTRICT */}
          <Select
            value={district}
            onValueChange={(v) => {
              setDistrict(v)
              onDistrictFilter(v)
            }}
          >
            <SelectTrigger className="w-[220px] h-10 border-2">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DISTRICT_CODE_TO_NAME).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* CHANCES */}
          <Select
            value={chances}
            onValueChange={(v) => {
              setChances(v)
              onChancesFilter(v)
            }}
          >
            <SelectTrigger className="w-[160px] h-10 border-2">
              <SelectValue placeholder="Chances" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* ROUND */}
          <Select
            value={round}
            onValueChange={(v) => {
              setRound(v)
              onRoundFilter(v)
            }}
          >
            <SelectTrigger className="w-[150px] h-10 border-2">
              <SelectValue placeholder="Round" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1">Round 1</SelectItem>
              <SelectItem value="2">Round 2</SelectItem>
              <SelectItem value="3">Round 3</SelectItem>
            </SelectContent>
          </Select>

          {/* CLEAR */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="ml-auto h-10 border-2"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
