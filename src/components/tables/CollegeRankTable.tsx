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
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface CollegeRankTableProps {
  colleges: CollegeRanking[]
  title?: string
}

export const CollegeRankTable = ({ colleges, title = "College Rankings" }: CollegeRankTableProps) => {
  const router = useRouter()

  if (colleges.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          No colleges found
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold w-16">Rank</TableHead>
                <TableHead className="font-semibold">College ID</TableHead>
                <TableHead className="font-semibold">College Name</TableHead>
                <TableHead className="font-semibold">Most Competitive</TableHead>
                <TableHead className="font-semibold text-right">Top Rank</TableHead>
                <TableHead className="font-semibold">Least Competitive</TableHead>
                <TableHead className="font-semibold text-right">Bottom Rank</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleges.map((college) => (
                <TableRow 
                  key={college.collegeID}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/explore/college/${college.collegeID}`)}
                >
                  <TableCell className="font-bold text-primary">{college.collegeRank}</TableCell>
                  <TableCell className="font-mono text-sm">{college.collegeID}</TableCell>
                  <TableCell className="font-medium">{college.collegeName}</TableCell>
                  <TableCell className="text-chart-high font-medium">{college.mostCompetitiveCourse}</TableCell>
                  <TableCell className="text-right font-mono">{college.mostCompetitiveRank.toLocaleString()}</TableCell>
                  <TableCell className="text-chart-low">{college.leastCompetitiveCourse}</TableCell>
                  <TableCell className="text-right font-mono">{college.leastCompetitiveRank.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
