import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
)

export const TableSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
)

export const StatCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-9 w-16 mb-2" />
    <Skeleton className="h-3 w-32" />
  </div>
)

export const CollegeCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex justify-between mb-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
      <div>
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div>
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  </div>
)
