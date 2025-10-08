"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, Users, TrendingUp, GraduationCap } from "lucide-react"
import { type College, getCourseCode } from "@/lib/types"

interface CollegeCardProps {
  college: College
}

export function CollegeCard({ college }: CollegeCardProps) {
  const courseCode = getCourseCode(college.course)

  const cleanCollegeName = college.collegeName.split(",")[0].trim()
  const collegeLocation = college.collegeName.includes(",")
    ? college.collegeName.split(",").slice(1).join(",").trim()
    : ""

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-foreground leading-tight line-clamp-2">
              {cleanCollegeName}
            </CardTitle>
            {collegeLocation && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{collegeLocation}</p>}
          </div>
          <Badge variant="outline" className="text-xs font-mono shrink-0">
            {college.collegeID}
          </Badge>
        </div>
        <CardDescription className="text-sm leading-tight">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span className="line-clamp-2">{college.course}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {courseCode}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Category</span>
          </div>
          <Badge variant="secondary" className="justify-self-end text-xs">
            {college.category}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Year & Round</span>
          </div>
          <span className="text-sm font-medium justify-self-end">
            {college.year} - R{college.round}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Cutoff Rank</span>
          </div>
          <span className="text-sm font-bold text-destructive justify-self-end">
            {college.cutoffRank.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">GM Rank</span>
          </div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400 justify-self-end">
            {college.gmRank.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
