"use client"

import { useEffect, useState } from "react"
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
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

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
  ChevronsUpDown,
  Check,
} from "lucide-react"

/* ================= TYPES ================= */

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
}

/* ================= CONSTANTS ================= */

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

/* ================= MAIN COMPONENT ================= */

export default function KCETPreferencePage() {
  /* -------- Student Details -------- */
  const [rank, setRank] = useState<number | "">("")
  const [category, setCategory] = useState("GM")
  const [hk, setHk] = useState(false)
  const [rural, setRural] = useState(false)
  const [kannada, setKannada] = useState(false)

  /* -------- College & Course -------- */
  const [colleges, setColleges] = useState<College[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCollege, setSelectedCollege] =
    useState<College | null>(null)
  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null)

  const [collegeOpen, setCollegeOpen] = useState(false)
  const [courseOpen, setCourseOpen] = useState(false)

  const [preferences, setPreferences] = useState<
    Preference[]
  >([])

  const [loadingCourses, setLoadingCourses] =
    useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  /* ================= FETCH COLLEGES ================= */

  useEffect(() => {
    fetch("/api/colleges/kcet/")
      .then((res) => res.json())
      .then((data) => {
        const unique = Array.from(
          new Map(
            (data?.colleges ?? []).map(
              (c: College) => [c.collegeID, c]
            )
          ).values()
        ) as College[]

        setColleges(unique)
      })
  }, [])

  /* ================= FETCH COURSES ================= */

  useEffect(() => {
    if (!selectedCollege) return

    setLoadingCourses(true)
    setCourses([])
    setSelectedCourse(null)

    fetch(
      `/api/colleges/kcet/${selectedCollege.collegeID}/course-codes`
    )
      .then((res) => res.json())
      .then((data) => {
        const list =
          data?.colleges?.[0]?.CourseList ?? []
        setCourses(list)
      })
      .finally(() => setLoadingCourses(false))
  }, [selectedCollege])

  /* ================= ADD PREFERENCE ================= */

  const addPreference = () => {
    if (!selectedCollege || !selectedCourse) return

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
      },
    ])

    setSelectedCourse(null)
  }

  /* ================= REMOVE ================= */

  const removePreference = (id: string) => {
    setPreferences((prev) =>
      prev.filter((p) => p.id !== id)
    )
  }

  /* ================= DRAG ================= */

  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setPreferences((items) => {
      const oldIndex = items.findIndex(
        (i) => i.id === active.id
      )
      const newIndex = items.findIndex(
        (i) => i.id === over.id
      )

      const updated = [...items]
      const [moved] = updated.splice(oldIndex, 1)
      updated.splice(newIndex, 0, moved)
      return updated
    })
  }

  /* ================= SUBMIT ================= */

  const submitPreferences = async () => {
    if (!rank || preferences.length === 0) return

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
      const res = await fetch(
        "/api/predictions/kcet/preference",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()
      setResult(data.result)
    } catch (err) {
      console.error(err)
      alert("Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">

      {/* ================= STUDENT DETAILS ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Enter Rank"
              value={rank}
              onChange={(e) =>
                setRank(
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
            />

            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger>
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

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hk}
                onCheckedChange={() =>
                  setHk(!hk)
                }
              />
              HK
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={rural}
                onCheckedChange={() =>
                  setRural(!rural)
                }
              />
              Rural
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={kannada}
                onCheckedChange={() =>
                  setKannada(!kannada)
                }
              />
              Kannada
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= PREFERENCES ================= */}

      <Card>
        <CardHeader>
          <CardTitle>Add Preference</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* College Search */}
          <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedCollege
                  ? `${selectedCollege.collegeName} (${selectedCollege.collegeID})`
                  : "Select College"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[420px] p-0">
              <Command>
                <CommandInput placeholder="Search college..." />
                <CommandEmpty>No college found</CommandEmpty>
                <CommandGroup className="max-h-72 overflow-y-auto">
                  {colleges.map((college) => (
                    <CommandItem
                      key={college.collegeID}
                      value={`${college.collegeName} ${college.collegeID}`}
                      onSelect={() => {
                        setSelectedCollege(college)
                        setCollegeOpen(false)
                      }}
                    >
                      {college.collegeName} ({college.collegeID})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Course Search */}
          <Popover open={courseOpen} onOpenChange={setCourseOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!selectedCollege}
                className="w-full justify-between"
              >
                {selectedCourse
                  ? `${selectedCourse.course_name}`
                  : "Select Course"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[420px] p-0">
              <Command>
                <CommandInput placeholder="Search course..." />
                <CommandEmpty>No course found</CommandEmpty>
                <CommandGroup className="max-h-72 overflow-y-auto">
                  {courses.map((course) => {
                    const alreadySelected = preferences.some(
                      (p) =>
                        p.college_code === selectedCollege?.collegeID &&
                        p.course_code === course.course_code
                    )

                    return (
                      <CommandItem
                        key={course.course_code}
                        disabled={alreadySelected}
                        value={course.course_name}
                        onSelect={() => {
                          setSelectedCourse(course)
                          setCourseOpen(false)
                        }}
                      >
                        {course.course_name}
                        {alreadySelected && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Selected
                          </span>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            onClick={addPreference}
            disabled={!selectedCollege || !selectedCourse}
            className="w-full"
          >
            Add Preference
          </Button>

        </CardContent>
      </Card>

      {/* Preference List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Preference Order</CardTitle>
        </CardHeader>

        <CardContent>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={preferences.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {preferences.map((pref, index) => (
                  <SortableItem
                    key={pref.id}
                    pref={pref}
                    index={index}
                    onRemove={removePreference}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        className="w-full"
        disabled={!rank || preferences.length === 0 || submitting}
        onClick={submitPreferences}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Preferences"
        )}
      </Button>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Allotment Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>College:</strong> {result.college_name}</p>
            <p><strong>Course:</strong> {result.course}</p>
            <p><strong>Cutoff Rank:</strong> {result.cutoff_rank}</p>
            <p><strong>Preference No:</strong> {result.preference_no}</p>
            <p><strong>Reason:</strong> {result.reason}</p>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

/* ================= SORTABLE ITEM ================= */

function SortableItem({
  pref,
  index,
  onRemove,
}: {
  pref: Preference
  index: number
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: pref.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex items-center justify-between border rounded-md px-3 py-2"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold">
          {index + 1}
        </span>

        <GripVertical
          className="h-4 w-4 cursor-grab text-muted-foreground"
          {...attributes}
          {...listeners}
        />

        <span className="text-sm">
          {pref.college_name} ({pref.college_code}) — {pref.course_code}
        </span>
      </div>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => onRemove(pref.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
