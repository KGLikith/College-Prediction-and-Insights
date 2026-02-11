"use client"

import { useEffect, useState, useMemo } from "react"
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  GripVertical,
  X,
  Loader2,
  Check,
} from "lucide-react"

interface College {
  collegeID: string
  collegeName: string
}

interface Course {
  course_name: string
  course_code: string
}

interface Preference {
  id: string
  college_code: string
  college_name: string
  course_code: string
  course_name: string
}

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

export default function PreferencePage() {
  const [rank, setRank] = useState<number | "">("")
  const [category, setCategory] = useState("GM")
  const [hk, setHk] = useState(false)
  const [rural, setRural] = useState(false)
  const [kannada, setKannada] = useState(false)

  const [colleges, setColleges] = useState<College[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [preferences, setPreferences] = useState<Preference[]>([])

  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingColleges, setLoadingColleges] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [collegeSearch, setCollegeSearch] = useState("")
  const [courseSearch, setCourseSearch] = useState("")

  const filteredColleges = useMemo(() => {
    if (!collegeSearch) return colleges
    return colleges.filter((c) =>
      `${c.collegeName} ${c.collegeID}`.toLowerCase().includes(collegeSearch.toLowerCase())
    )
  }, [colleges, collegeSearch])

  const filteredCourses = useMemo(() => {
    if (!courseSearch) return courses
    return courses.filter((c) =>
      c.course_name.toLowerCase().includes(courseSearch.toLowerCase())
    )
  }, [courses, courseSearch])

  useEffect(() => {
    fetch("/api/colleges/kcet/")
      .then((res) => res.json())
      .then((data) => {
        const unique = Array.from(
          new Map(
            (data?.colleges ?? []).map((c: College) => [c.collegeID, c])
          ).values()
        ) as College[]
        setColleges(unique)
      })
      .finally(() => setLoadingColleges(false))
  }, [])

  useEffect(() => {
    if (!selectedCollege) return

    setLoadingCourses(true)
    setCourses([])
    setSelectedCourse(null)

    fetch(`/api/colleges/kcet/${selectedCollege.collegeID}/course-codes`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.colleges?.[0]?.CourseList ?? []
        setCourses(list)
      })
      .finally(() => setLoadingCourses(false))
  }, [selectedCollege])

  const addPreference = () => {
    if (!selectedCollege || !selectedCourse || submitting) return

    const duplicate = preferences.some(
      (p) =>
        p.college_code === selectedCollege.collegeID &&
        p.course_code === selectedCourse.course_code
    )

    if (duplicate) return

    setPreferences((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        college_code: selectedCollege.collegeID,
        college_name: selectedCollege.collegeName,
        course_code: selectedCourse.course_code,
        course_name: selectedCourse.course_name,
      },
    ])

    setSelectedCourse(null)
    setCourseSearch("")
  }

  const removePreference = (id: string) => {
    if (submitting) return;
    setPreferences((prev) => prev.filter((p) => p.id !== id))
  }

  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id || submitting) return

    setPreferences((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)

      const updated = [...items]
      const [moved] = updated.splice(oldIndex, 1)
      updated.splice(newIndex, 0, moved)
      return updated
    })
  }

  const submitPreferences = async () => {
    if (!rank || preferences.length === 0 || submitting) return

    setSubmitting(true)

    const payload = {
      rank: Number(rank),
      cat: category,
      hk,
      rural,
      kannada,
      preferences: preferences.map((p) => ({
        college_code: p.college_code,
        course_code: p.course_code,
      })),
    }

    try {
      const res = await fetch("/api/predictions/kcet/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      setResult(data.result)
    } catch (err) {
      console.error(err)
      alert("Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 p-6 pt-2 pb-0">

      <div className="flex-1 flex flex-col space-y-2 lg:max-h-full lg:overflow-y-auto lg:pr-6 lg:border-r lg:border-neutral-200 dark:lg:border-neutral-800 pl-1">
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex flex-col gap-0">
            <h1 className="mb-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Preference Builder
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Enter your details and arrange colleges in priority order
            </p>
          </div>


          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  KCET Rank
                </label>
                <Input
                  type="number"
                  placeholder="Enter rank"
                  value={rank}
                  onChange={(e) =>
                    setRank(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  disabled={submitting}
                  className="border-neutral-200 dark:border-neutral-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory} disabled={submitting}>
                  <SelectTrigger className="border-neutral-200 dark:border-neutral-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KCET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Additional Details
                </label>

                <div className="flex items-center gap-6 h-10">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={hk} onCheckedChange={() => setHk(!hk)} disabled={submitting} />
                    <span className="text-sm">HK</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox checked={rural} onCheckedChange={() => setRural(!rural)} disabled={submitting} />
                    <span className="text-sm">Rural</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox checked={kannada} onCheckedChange={() => setKannada(!kannada)} disabled={submitting} />
                    <span className="text-sm">Kannada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800" />

        <div className="space-y-4 animate-in fade-in duration-500 delay-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Add Preference
            </h2>

            <Button
              onClick={addPreference}
              disabled={!selectedCollege || !selectedCourse || submitting}
              className="h-10 bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Add
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                College ({filteredColleges.length} available)
              </label>
              <div className="space-y-2">
                <Input
                  placeholder="Search college..."
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  className="border-neutral-200 dark:border-neutral-800"
                  disabled={submitting}
                />

                <div className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900 max-h-60 overflow-y-auto thin-scrollbar p-1">

                  {loadingColleges ? (
                    <div className="p-6 flex flex-col items-center justify-center gap-3 text-sm text-neutral-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading colleges...
                    </div>
                  ) : filteredColleges.length === 0 ? (
                    <div className="p-4 text-center text-sm text-neutral-500">
                      No colleges found
                    </div>
                  ) : (

                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {filteredColleges.map((college) => (
                        <button
                          key={college.collegeID}
                          onClick={() => {
                            setSelectedCollege(college)
                            setCollegeSearch("")
                          }}
                          className={`w-full text-left px-4 py-3 transition-colors ${selectedCollege?.collegeID === college.collegeID
                            ? "bg-neutral-200 dark:bg-neutral-800"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                            }`}
                          disabled={submitting}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                {college.collegeName}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {college.collegeID}
                              </p>
                            </div>
                            {selectedCollege?.collegeID === college.collegeID && (
                              <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-50" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedCollege && (
                <div className="mt-3 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                        Selected College
                      </p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        {selectedCollege.collegeName}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              )}

            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Course ({filteredCourses.length} available)
              </label>
              <div className="space-y-2">
                <Input
                  placeholder="Search course..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  disabled={!selectedCollege || submitting}
                  className="border-neutral-200 dark:border-neutral-800 disabled:opacity-50"
                />

                <div className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900 max-h-64 overflow-y-auto thin-scrollbar p-1">


                  {loadingCourses ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-sm text-neutral-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading courses...
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="p-4 text-center text-sm text-neutral-500">
                      {selectedCollege ? "No courses found" : "Select a college first"}
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {filteredCourses.map((course) => {
                        const isSelected = preferences.some(
                          (p) =>
                            p.college_code === selectedCollege?.collegeID &&
                            p.course_code === course.course_code
                        )

                        return (
                          <button
                            key={course.course_code}
                            onClick={() => {
                              setSelectedCourse(course)
                              setCourseSearch("")
                            }}
                            disabled={isSelected || submitting}
                            className={`w-full text-left px-4 py-3 transition-colors ${selectedCourse?.course_code === course.course_code
                              ? "bg-neutral-200 dark:bg-neutral-800"
                              : isSelected
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                                  {course.course_name}
                                </p>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                  {course.course_code}
                                </p>
                              </div>
                              {isSelected && (
                                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                  Added
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {selectedCourse && (
                <div className="mt-3 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                        Selected Course
                      </p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        {selectedCourse.course_name}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      <div className="flex w-full flex-col space-y-4 animate-in fade-in duration-500 delay-200 lg:w-96">
        {result && (
          <div
            className={`rounded-xl border p-5 space-y-4 shadow-sm transition-all
    ${result.college_name
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
              }`}
          >

            <div className="flex items-center justify-between">
              <h3
                className={`text-base font-semibold ${result.college_name
                  ? "text-green-900 dark:text-green-50"
                  : "text-red-900 dark:text-red-50"
                  }`}
              >
                {result.college_name ? "🎉 Allotment Result" : "No Allotment"}
              </h3>
            </div>

            {result.college_name ? (
              <div className="grid grid-cols-1 gap-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    College
                  </span>
                  <span className="font-medium text-green-900 dark:text-green-100 text-right">
                    {result.college_name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Course
                  </span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {result.course}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Cutoff Rank
                  </span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {result.cutoff_rank}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Preference Number
                  </span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {result.preference_no}
                  </span>
                </div>

              </div>
            ) : (
              <div className="text-sm text-red-800 dark:text-red-200 space-y-2">
                <p className="font-medium">
                  No college could be allotted.
                </p>

                {result.reason && (
                  <div className="rounded-md bg-red-100 dark:bg-red-900/30 px-3 py-2 text-xs border border-red-200 dark:border-red-800">
                    {result.reason}
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        <div className="sticky top-0 z-10 space-y-4 bg-neutral-50 dark:bg-neutral-950 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Check Preference Order
            </h2>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              {preferences.length} preference{preferences.length !== 1 ? "s" : ""} added
            </p>
          </div>
          <Button
            onClick={submitPreferences}
            disabled={!rank || preferences.length === 0 || submitting}
            className="w-full bg-neutral-900 font-medium text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting
              </>
            ) : (
              "Submit Preferences"
            )}
          </Button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/30">
          {preferences.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Add preferences from the form to see them here
              </p>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={preferences.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {preferences.map((pref, index) => (
                    <SortablePreferenceItem
                      key={pref.id}
                      pref={pref}
                      index={index}
                      onRemove={removePreference}
                      submitting={submitting}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}

function SortablePreferenceItem({
  pref,
  index,
  onRemove,
  submitting
}: {
  pref: Preference
  index: number
  onRemove: (id: string) => void
  submitting: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pref.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isDragging
        ? "opacity-50 border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800"
        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
        }`}
    >
      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
        {index + 1}
      </span>

      {!submitting && <GripVertical
        className="h-4 w-4 text-neutral-500 dark:text-neutral-500 cursor-grab active:cursor-grabbing flex-shrink-0"
        {...attributes}
        {...listeners}
      />}

      <div className="flex-1 min-w-0 flex items-start justify-between gap-4">

        <div className="min-w-0 flex flex-col">

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate cursor-default">
                  {pref.college_name}
                </p>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {pref.college_name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {pref.college_code}
          </span>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap cursor-default">
                {pref.course_code}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {pref.course_name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>

      <Button
        size="icon"
        variant="ghost"
        disabled={isDragging || submitting}
        className="hover:bg-red-100/50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
        onClick={() => onRemove(pref.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
