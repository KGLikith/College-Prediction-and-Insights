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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Filter, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { COURSE_NAME_TO_CODE, DISTRICT_CODE_TO_NAME, COURSE_CATEGORIES } from "@/lib/types"

interface ResultsFilterProps {
  collegeCount: number
  initialValues: {
    collegeId: string
    course: string
    category: string
    chances: string
    round: string
    district: string
  }
  onApplyFilters: (filters: {
    collegeId: string
    course: string
    category: string
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

  const [collegeId, setCollegeId] = useState(initialValues.collegeId)
  const [course, setCourse] = useState(initialValues.course || "all")
  const [category, setCategory] = useState(initialValues.category || "all")
  const [chances, setChances] = useState(initialValues.chances || "all")
  const [round, setRound] = useState(initialValues.round || "all")
  const [district, setDistrict] = useState(initialValues.district || "ALL")

  const [colleges, setColleges] = useState<{ collegeID: string; collegeName: string }[]>([])
  const [isLoadingColleges, setIsLoadingColleges] = useState(false)

  const [collegeCourses, setCollegeCourses] = useState<any[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setIsLoadingColleges(true)
        const res = await fetch("/api/colleges/kcet")
        if (res.ok) {
          const data = await res.json()
          setColleges(data.colleges || [])
        }
      } catch (error) {
        console.error("Failed to fetch colleges", error)
      } finally {
        setIsLoadingColleges(false)
      }
    }
    fetchColleges()
  }, [])

  useEffect(() => {
    if (!collegeId || collegeId === "ALL") {
      setCollegeCourses([])
      return
    }

    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true)

        const res = await fetch(`/api/colleges/kcet/${collegeId}/course-codes`)
        if (res.ok) {
          const data = await res.json()
          const list = data?.colleges?.[0]?.CourseList ?? []
          setCollegeCourses(list)

          if (course && course !== "all") {
            const courseExists = list.some((c: any) => c.course_code === course)
            if (!courseExists) {
              setCourse("all")
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch college courses", error)
      } finally {
        setIsLoadingCourses(false)
      }
    }

    fetchCourses()
  }, [collegeId, course])

  useEffect(() => {
    setCollegeId(initialValues.collegeId)
    setCourse(initialValues.course)
    setCategory(initialValues.category)
    setChances(initialValues.chances)
    setRound(initialValues.round)
    setDistrict(initialValues.district)
  }, [initialValues])


  const hasActiveFilters =
    collegeId !== "" ||
    course !== "all" ||
    category !== "all" ||
    chances !== "all" ||
    round !== "all" ||
    district !== "ALL"

  const handleApply = () => {
    onApplyFilters({
      collegeId,
      course,
      category,
      chances,
      round,
      district,
    })
  }

  const handleClear = () => {
    setCollegeId("")
    setCourse("all")
    setCategory("all")
    setChances("all")
    setRound("all")
    setDistrict("ALL")

    onClearFilters()
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6 px-6 space-y-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2 font-semibold text-sm">
            <Filter className="h-5 w-5 text-primary" />
            Filters
            <span className="text-muted-foreground font-normal">
              ({collegeCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
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

        <div className="flex flex-wrap items-end gap-4">

          <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
            <label className="text-xs font-medium text-muted-foreground">
              Select College
            </label>

            <Select
              value={collegeId || "ALL"}
              onValueChange={(v) => setCollegeId(v === "ALL" ? "" : v)}
            >
              <SelectTrigger className="w-full">
                <span className="truncate w-full text-left">
                  {collegeId ? (
                    <span className="flex items-center gap-2">
                      <span>{colleges.find((c) => c.collegeID === collegeId)?.collegeName}</span>
                      <span className="text-xs text-muted-foreground">
                        {collegeId}
                      </span>
                    </span>
                  ) : (
                    "ALL Colleges"
                  )}
                </span>
              </SelectTrigger>

              <SelectContent className="w-[420px]">

                <div className="p-2 border-b">
                  <Input
                    placeholder="Search college..."
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase()
                      const items = document.querySelectorAll("[data-college-item]")
                      items.forEach((el) => {
                        const text = el.textContent?.toLowerCase() || ""
                          ; (el as HTMLElement).style.display = text.includes(value)
                            ? "block"
                            : "none"
                      })
                    }}
                  />
                </div>

                <div className="max-h-[260px] overflow-y-auto scrollbar-none">

                  <SelectItem value="ALL">
                    <span className="font-semibold">ALL Colleges</span>
                  </SelectItem>

                  {isLoadingColleges ? (
                    <div className="flex items-center justify-center">Loading courses...</div>
                  ) : colleges.map((college) => (
                    <SelectItem
                      key={college.collegeID}
                      value={college.collegeID}
                      data-college-item
                      className="py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {college.collegeName}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {college.collegeID}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                  }

                </div>

              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-muted-foreground">
              Course
            </label>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger className="h-10">
                <span className="truncate max-w-[100px] text-left">
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {isLoadingCourses ? (
                  <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                ) : collegeCourses.length > 0 ? (
                  collegeCourses.map((c: any) => (
                    <SelectItem key={c.course_code} value={c.course_code}>
                      {c.course_name} ({c.course_code})
                    </SelectItem>
                  ))
                ) : (
                  Object.entries(COURSE_CATEGORIES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name} ({code})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-muted-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["GM", "1G", "2AG", "2BG", "3AG", "3BG", "SCG", "STG", "KKR"].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
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

          <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
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

          <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
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
