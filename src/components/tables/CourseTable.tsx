import { CourseInfo, CourseWithCutoff } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CourseTableProps {
  courses: (CourseInfo | CourseWithCutoff)[]
  title?: string
  showCutoff?: boolean
}

export const CourseTable = ({ courses, title = "Courses", showCutoff = false }: CourseTableProps) => {
  if (courses.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          No courses found
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
                <TableHead className="font-semibold">Course Name</TableHead>
                <TableHead className="font-semibold text-right">Course Rank</TableHead>
                {showCutoff && <TableHead className="font-semibold text-right">Cutoff Rank</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course, index) => (
                <TableRow 
                  key={`${course.courseName}-${index}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">{course.courseName}</TableCell>
                  <TableCell className="text-right font-mono">{course.courseRank}</TableCell>
                  {showCutoff && "minRank" in course && (
                    <TableCell className="text-right font-mono">{course.minRank.toLocaleString()}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
