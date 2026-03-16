"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import { INDIAN_STATES, COURSE_CATEGORIES } from "@/lib/types"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "./ui/checkbox"

type Props = {
  examType: "kcet" | "comedk" | "jee"
}

interface CollegeOption {
  collegeID: string
  collegeName: string
}

const CATEGORY_OPTIONS: Record<string, string[]> = {
  kcet: ["GM", "1G", "2AG", "2BG", "3AG", "3BG", "SCG", "STG", "KKR"],
  comedk: ["GM", "KKR"],
  jee: ["OPEN", "OBC-NCL", "EWS", "SC", "ST"],
}

const ROUND_OPTIONS: Record<Props["examType"], string[]> = {
  kcet: ["1", "2", "3"],
  comedk: ["1", "2", "3", "4"],
  jee: ["1", "2", "3", "4"],
}

export function FormFields({ examType }: Props) {
  const form = useFormContext()
  const [colleges, setColleges] = React.useState<CollegeOption[]>([])
  const [isLoadingColleges, setIsLoadingColleges] = React.useState(false)
  const [collegeSearch, setCollegeSearch] = React.useState("")

  const [collegeCourses, setCollegeCourses] = React.useState<any[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = React.useState(false)

  const selectedCollegeId = form.watch("college")

  React.useEffect(() => {
    if (examType === "kcet") {
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
    } else {
      setColleges([])
    }
  }, [examType])

  React.useEffect(() => {
    if (!selectedCollegeId || selectedCollegeId === "ALL") {
      setCollegeCourses([])
      return
    }

    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true)
        const res = await fetch(`/api/colleges/kcet/${selectedCollegeId}/course-codes`)
        if (res.ok) {
          const data = await res.json()
          const list = data?.colleges?.[0]?.CourseList ?? []
          setCollegeCourses(list)

          const currentCourse = form.getValues("course")
          if (currentCourse && currentCourse !== "ALL") {
            const courseExists = list?.some((c: any) => c.course_code === currentCourse)
            if (!courseExists) {
              form.setValue("course", undefined)
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
  }, [selectedCollegeId, form])

  if (!form) return null

  const isJEE = examType === "jee"

  return (
    <div className="w-full space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
        <FormField
          control={form.control}
          name="rank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Rank <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Rank"
                  min={1}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? undefined : Number(e.target.value)
                    field.onChange(val && val > 0 ? val : undefined)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_OPTIONS[examType].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="round"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Round</FormLabel>
              <Select
                value={String(field.value || "ALL")}
                onValueChange={(v) =>
                  field.onChange(v === "ALL" ? undefined : Number(v))
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ALL" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ALL">ALL</SelectItem>
                  {ROUND_OPTIONS[examType].map((r) => (
                    <SelectItem key={r} value={r}>
                      Round {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="college"
          render={({ field }) => {
            const filteredColleges = colleges.filter((c) =>
              `${c.collegeName} ${c.collegeID}`
                .toLowerCase()
                .includes(collegeSearch.toLowerCase())
            )

            const selectedCollege =
              colleges.find((c) => c.collegeID === field.value)

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Preferred College</FormLabel>

                <Select
                  value={field.value || "ALL"}
                  onValueChange={(v) => field.onChange(v === "ALL" ? undefined : v)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      {isLoadingColleges ? <>
                        <div className="flex items-center justify-center">Loading colleges...</div>
                      </>
                      :
                      <span className="truncate w-full text-left">
                        {selectedCollege ? (
                          <span className="flex items-center gap-2">
                            <span>{selectedCollege.collegeName}</span>
                            <span className="text-xs text-muted-foreground">
                              • {selectedCollege.collegeID}
                            </span>
                          </span>
                        ) : (
                          "ALL Colleges"
                        )}
                      </span>}
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="w-[420px]">

                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search college..."
                        value={collegeSearch}
                        onChange={(e) => setCollegeSearch(e.target.value)}
                      />
                    </div>

                    <div className="max-h-[260px] overflow-y-auto scrollbar-none">

                      <SelectItem value="ALL">
                        <span className="font-semibold">ALL Colleges</span>
                      </SelectItem>

                      {filteredColleges.map((college) => (
                        <SelectItem
                          key={college.collegeID}
                          value={college.collegeID}
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
                      ))}

                    </div>

                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Course</FormLabel>
              <Select
                value={(field.value as string) || "ALL"}
                onValueChange={(v) =>
                  field.onChange(v === "ALL" ? undefined : v)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ALL" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  <SelectItem value="ALL">ALL</SelectItem>
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {examType === "kcet" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-base">
              Additional KCET Details
            </h3>
            <p className="text-sm text-muted-foreground">
              Select if any apply
            </p>
          </div>

          <div className="flex gap-10">
            {["hk", "rural", "kannada"].map((name) => (
              <FormField
                key={name}
                control={form.control}
                name={name as any}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(c) => field.onChange(!!c)}
                      />
                    </FormControl>
                    <FormLabel className="font-normal capitalize">
                      {name}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      )}

      {isJEE && (
        <div className="space-y-10">

          <h3 className="font-semibold text-base">
            Additional JEE Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gender <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>
      )}
    </div>
  )
}
