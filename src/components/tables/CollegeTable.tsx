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
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
      </div>

      <Card className="shadow-md border gap-1 p-0">
        <CardContent className="p-0">
          <div className="overflow-x-hidden rounded-lg border">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[90px] px-4 py-3 text-sm font-semibold">
                    ID
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
                  <TableHead className="w-[80px] px-4 py-3 text-sm font-semibold text-center">
                    Round
                  </TableHead>
                  <TableHead className="w-[120px] px-4 py-3 text-sm font-semibold text-right">
                    Cutoff
                  </TableHead>
                  <TableHead className="w-[120px] px-4 py-3 text-sm font-semibold text-right">
                    GM Rank
                  </TableHead>
                  <TableHead className="w-[110px] px-4 py-3 text-sm font-semibold text-center">
                    Chance
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {colleges.map((college, index) => (
                  <TableRow
                    key={`${college.collegeID}-${index}`}
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
                      {college.cutoffRank.toLocaleString()}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right font-mono">
                      {college.gmRank.toLocaleString()}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-center">
                      <ChanceBadge chance={college.chances} />
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
