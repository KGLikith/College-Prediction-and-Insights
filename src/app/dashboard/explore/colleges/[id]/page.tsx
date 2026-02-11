"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { StatCard } from "@/components/StatCard"
import {
  ChartSkeleton,
  TableSkeleton,
  StatCardSkeleton,
} from "@/components/LoadingSkeleton"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  GraduationCap,
  Trophy,
  TrendingDown,
  BookOpen,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CollegeCourses, CollegeCutoffs, CourseWithCutoff } from "@/lib/types"
import { DashboardLayout } from "../../DashboardLayout"
import { CourseRankHeatmap } from "@/components/charts/CourseRankHeatmap"
import { CourseTable } from "@/components/tables/CourseTable"
import { CutoffDivergingChart } from "@/components/charts/CutoffDivergingChart"

const CollegeDetailPage = () => {
  const { id: collegeCode } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get("cat") || "GM"

  const [courses, setCourses] = useState<CollegeCourses | null>(null)
  const [cutoffs, setCutoffs] = useState<CollegeCutoffs | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("courses")

  useEffect(() => {
    if (!collegeCode) return

    const fetchData = async () => {
      try {
        setIsLoading(true)

        const [coursesRes, cutoffsRes] = await Promise.all([
          fetch(`/api/colleges/kcet/${collegeCode}/courses`, {
            cache: "no-store",
          }),
          fetch(
            `/api/colleges/kcet/${collegeCode}/cutoffs?cat=${category}`,
            { cache: "no-store" }
          ),
        ])

        if (!coursesRes.ok || !cutoffsRes.ok) {
          throw new Error("Failed to fetch college data")
        }

        const coursesData = await coursesRes.json()
        const cutoffsData = await cutoffsRes.json()

        setCourses(coursesData.colleges?.[0] || null)
        setCutoffs(cutoffsData.colleges?.[0] || null)
      } catch (err) {
        console.error(err)
        setCourses(null)
        setCutoffs(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [collegeCode, category])

  const courseList = courses?.CourseList || []
  const cutoffList = cutoffs?.CourseList || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/explore/colleges")}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Colleges
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {courses?.collegeName || "Loading..."}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : (
            <>
              <StatCard
                title="Total Courses"
                value={courseList.length}
                icon={BookOpen}
              />
              <StatCard
                title="Top Course"
                value={courseList[0]?.courseName || "-"}
                icon={Trophy}
              />
              <StatCard
                title="Lowest Cutoff"
                value={Math.min(
                  ...cutoffList.map((c) => c.minRank)
                ).toLocaleString()}
                icon={TrendingDown}
              />
              <StatCard
                title="Highest Cutoff"
                value={Math.max(
                  ...cutoffList.map((c) => c.minRank)
                ).toLocaleString()}
                icon={GraduationCap}
              />
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="cutoffs">Cutoffs</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <>
              <ChartSkeleton />
              <TableSkeleton />
            </>
          ) : (
            <>
              <TabsContent value="courses" className="space-y-6 mt-6">

                <CourseRankHeatmap courses={courseList} title="Course Rankings by Competitiveness" />
              </TabsContent>
              <TabsContent value="cutoffs" className="space-y-6 mt-6">
                <CutoffDivergingChart
                  courses={cutoffList as CourseWithCutoff[]}
                />
              </TabsContent>

              <CourseTable courses={cutoffList} title="All Courses" showCutoff />
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default CollegeDetailPage
