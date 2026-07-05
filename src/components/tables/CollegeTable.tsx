"use client"

import React, { useEffect, useState } from "react"
import type { College } from "@/lib/types"
import { ChanceBadge } from "@/components/ChanceBadge"
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
import { Plus, Check, Info, ArrowUpDown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  collegeToShortlistItem,
  getShortlist,
  shortlistKey,
  toggleShortlist,
} from "@/lib/shortlist"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CollegeTableProps {
  colleges: College[]
  title?: string
}

export const CollegeTable = ({
  colleges,
  title = "All Predictions",
}: CollegeTableProps) => {
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{
    key: keyof College | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

  useEffect(() => {
    setShortlisted(
      new Set(
        getShortlist().map((i) => shortlistKey(i.college_code, i.course_code))
      )
    )
  }, [])

  const handleToggle = (college: College) => {
    const item = collegeToShortlistItem(college)
    const added = toggleShortlist(item)
    const key = shortlistKey(item.college_code, item.course_code)
    setShortlisted((prev) => {
      const next = new Set(prev)
      if (added) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const requestSort = (key: keyof College) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      // Third click removes sort
      setSortConfig({ key: null, direction: "asc" })
      return
    }
    setSortConfig({ key, direction })
  }

  const sortedColleges = React.useMemo(() => {
    const sortableItems = [...colleges]

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key!]
        let bValue = b[sortConfig.key!]

        if (aValue === undefined) aValue = "" as any
        if (bValue === undefined) bValue = "" as any

        let comparison = 0

        if (sortConfig.key === "chances") {
          const chanceOrder = { high: 3, medium: 2, low: 1 } as const
          const chanceA = chanceOrder[(a.chances as keyof typeof chanceOrder)] || 0
          const chanceB = chanceOrder[(b.chances as keyof typeof chanceOrder)] || 0
          comparison = chanceA - chanceB
        } else if (sortConfig.key === "round") {
          const roundA = parseInt(a.round as any) || 0
          const roundB = parseInt(b.round as any) || 0
          comparison = roundA - roundB
        } else {
          if (aValue < bValue) {
            comparison = -1
          } else if (aValue > bValue) {
            comparison = 1
          }
        }

        if (comparison !== 0) {
          return sortConfig.direction === "asc" ? comparison : -comparison
        }

        // Secondary sort by cutoffRank if primary sort isn't cutoffRank
        if (sortConfig.key !== "cutoffRank") {
          const cutoffA = a.cutoffRank || 0
          const cutoffB = b.cutoffRank || 0
          return cutoffA - cutoffB
        }

        return 0
      })
      return sortableItems
    }

    return sortableItems.sort((a, b) => {
      // 1. Sort by College Name (or ID if name is missing)
      const collegeCompare = (a.collegeName || a.collegeID || "").localeCompare(b.collegeName || b.collegeID || "")
      if (collegeCompare !== 0) return collegeCompare

      // 2. Sort by Course Name
      const courseCompare = (a.course || "").localeCompare(b.course || "")
      if (courseCompare !== 0) return courseCompare

      // 3. Sort by Round (numeric)
      const roundA = parseInt(a.round as any) || 0
      const roundB = parseInt(b.round as any) || 0
      return roundA - roundB
    })
  }, [colleges, sortConfig])

  if (colleges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
          No results found
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <Alert className="bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300 py-3">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm">
            <span>
              Use the <strong className="border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded bg-background text-xs mx-1 shadow-sm text-foreground">+</strong> buttons to add courses to your <strong>Preference Builder</strong>. Adding a course automatically selects all its rounds, as preferences are based on College + Course.
            </span>
          </AlertDescription>
        </Alert>
      </div>

      <Card className="shadow-md border gap-1 p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[90px] px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort("collegeID")}>
                    <div className="flex items-center gap-1">
                      ID <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[260px] px-4 py-3 text-sm font-semibold">
                    College Name
                  </TableHead>
                  <TableHead className="w-[140px] px-4 py-3 text-sm font-semibold">
                    Course
                  </TableHead>
                  <TableHead className="w-[90px] px-4 py-3 text-sm font-semibold text-center">
                    Cat
                  </TableHead>
                  <TableHead className="w-[80px] px-4 py-3 text-sm font-semibold text-center cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort("round")}>
                    <div className="flex items-center justify-center gap-1">
                      Round <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] px-4 py-3 text-sm font-semibold text-right">
                    Cutoff
                  </TableHead>
                  <TableHead className="w-[120px] px-4 py-3 text-sm font-semibold text-right">
                    GM Rank
                  </TableHead>
                  <TableHead className="w-[110px] px-4 py-3 text-sm font-semibold text-center cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => requestSort("chances")}>
                    <div className="flex items-center justify-center gap-1">
                      Chance <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px] px-2 py-3 text-sm font-semibold text-center">
                    <div className="flex items-center justify-center gap-1">
                      List
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px] font-normal" side="top">
                            Add courses to your Preference List to reorder and finalize them later.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedColleges.map((college, index) => (
                  <TableRow
                    key={`${college.collegeID}-${college.course}-${college.category}-${college.round}-${index}`}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="px-4 py-3 font-mono text-sm truncate">
                      {college.collegeID}
                    </TableCell>

                    <TableCell className="px-4 py-3 font-medium truncate">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-default">
                              {college.collegeName}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            {college.collegeName}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-muted-foreground truncate">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-default">
                              {college.course}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            {college.course}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-center">
                      {college.category}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-center">
                      {college.round}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right font-mono">
                      {college.cutoffRank?.toLocaleString() ?? "-"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right font-mono">
                      {college.gmRank?.toLocaleString() ?? "-"}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-center">
                      <ChanceBadge chance={college.chances} />
                    </TableCell>

                    <TableCell className="px-2 py-3 text-center">
                      {(() => {
                        const item = collegeToShortlistItem(college)
                        const added = shortlisted.has(
                          shortlistKey(item.college_code, item.course_code)
                        )
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleToggle(college)}
                                >
                                  {added ? (
                                    <Check className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {added
                                  ? "Remove from Preference List"
                                  : "Add to Preference List"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>

  )
}
