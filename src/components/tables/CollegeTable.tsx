import type { College } from "@/lib/types"
import { ChanceBadge } from "@/components/ChanceBadge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CollegeTableProps {
  colleges: College[]
  title?: string
}

export const CollegeTable = ({ colleges, title = "Results" }: CollegeTableProps) => {
  if (colleges.length === 0) {
    return (
      <Card className="animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          No results found
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in shadow-lg border-2">
      <CardContent className="p-0">
        <div className="rounded-lg border-2 border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="font-bold text-foreground">College ID</TableHead>
                <TableHead className="font-bold text-foreground">College Name</TableHead>
                <TableHead className="font-bold text-foreground">Course</TableHead>
                <TableHead className="font-bold text-foreground text-center">Round</TableHead>
                <TableHead className="font-bold text-foreground text-right">Cutoff Rank</TableHead>
                <TableHead className="font-bold text-foreground text-right">GM Rank</TableHead>
                <TableHead className="font-bold text-foreground text-center">Chances</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleges.map((college, index) => (
                <TableRow key={`${college.collegeID}-${index}`} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono text-sm font-medium">{college.collegeID}</TableCell>
                  <TableCell className="font-semibold">{college.collegeName}</TableCell>
                  <TableCell className="text-muted-foreground font-medium">{college.course}</TableCell>
                  <TableCell className="text-center font-medium">{college.round}</TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {college.cutoffRank.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">{college.gmRank.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <ChanceBadge chance={college.chances} />
                    </div>
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
