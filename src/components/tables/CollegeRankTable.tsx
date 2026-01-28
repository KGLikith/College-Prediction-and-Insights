'use client';

import { CollegeRanking } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CollegeRankTableProps {
  colleges: CollegeRanking[]
  title?: string
}

export const CollegeRankTable = ({ colleges, title = "College Rankings" }: CollegeRankTableProps) => {
  const router = useRouter()
  const [hoveredCollegeName, setHoveredCollegeName] = useState<string | null>(null)

  if (colleges.length === 0) {
    return (
      <Card className="animate-fade-in border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
          <Award className="h-12 w-12 mb-3 opacity-30" />
          No colleges found
        </CardContent>
      </Card>
    )
  }

  const truncateName = (name: string, maxLength: number = 25) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name
  }

  return (
    <Card className="animate-fade-in border-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/20 border-b-2">
                <TableHead className="font-bold w-12">Rank</TableHead>
                <TableHead className="font-bold">College ID</TableHead>
                <TableHead className="font-bold">College Name</TableHead>
                <TableHead className="font-bold">Most Competitive</TableHead>
                <TableHead className="font-bold text-right">Top Rank</TableHead>
                <TableHead className="font-bold">Least Competitive</TableHead>
                <TableHead className="font-bold text-right">Bottom Rank</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleges.map((college, idx) => (
                <TableRow 
                  key={idx}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-200 cursor-pointer border-b"
                  onClick={() => router.push(`/dashboard/explore/colleges/${college.collegeID}`)}
                  onMouseEnter={() => setHoveredCollegeName(college.collegeName)}
                  onMouseLeave={() => setHoveredCollegeName(null)}
                >
                  <TableCell className="font-bold text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm">
                      {college.collegeRank}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{college.collegeID}</TableCell>
                  <TableCell className="font-semibold relative group">
                    <span className="truncate max-w-[180px]">{truncateName(college.collegeName)}</span>
                    {hoveredCollegeName === college.collegeName && college.collegeName.length > 25 && (
                      <div className="absolute left-0 top-full mt-1 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                        {college.collegeName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold max-w-[150px] truncate">
                      {college.mostCompetitiveCourse}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">{college.mostCompetitiveRank.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold max-w-[150px] truncate">
                      {college.leastCompetitiveCourse}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-amber-600 dark:text-amber-400">{college.leastCompetitiveRank.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
