"use client"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Target,
  Users,
  TrendingUp,
  GraduationCap,
} from "lucide-react"
import { type College, getCourseCode } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CollegeCardProps {
  college: College
}

export function CollegeCard({ college }: CollegeCardProps) {
  const courseCode = getCourseCode(college.course)

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md border-l-4 border-l-primary/20">

      <CardHeader className="space-y-3 overflow-hidden">

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-base font-semibold truncate w-full">
                {college.collegeName}
              </h3>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              className="max-w-sm break-words"
            >
              {college.collegeName}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center justify-between gap-4 min-w-0">

          <div className="flex items-center gap-2 min-w-0">
            <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" />

            <span className="truncate text-sm text-muted-foreground">
              {college.course}
            </span>

            <Badge
              variant="secondary"
              className="text-xs shrink-0"
            >
              {courseCode}
            </Badge>
          </div>

          <Badge
            variant="outline"
            className="text-xs font-mono shrink-0"
          >
            {college.collegeID}
          </Badge>

        </div>

      </CardHeader>

      <CardContent className="space-y-3 pt-0 text-sm">

        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            Category
          </div>
          <Badge variant="secondary">{college.category}</Badge>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Round
          </div>
          <span className="font-medium">
            R{college.round}
          </span>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            Cutoff Rank
          </div>
          <span className="font-bold text-destructive">
            {college.cutoffRank.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            GM Rank
          </div>
          <span className="font-medium text-green-600 dark:text-green-400">
            {college.gmRank.toLocaleString()}
          </span>
        </div>

      </CardContent>
    </Card>
  )
}
