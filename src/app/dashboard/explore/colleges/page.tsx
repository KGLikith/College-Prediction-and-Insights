"use client"

import { useEffect, useState } from "react"
import { CollegeRankTable } from "@/components/tables/CollegeRankTable"
import { CompetitivenessRangeChart } from "@/components/charts/CompetitivenessRangeChart"
import { StatCard } from "@/components/StatCard"
import {
  ChartSkeleton,
  TableSkeleton,
  StatCardSkeleton,
} from "@/components/LoadingSkeleton"
import { Building2, Trophy, TrendingDown, TrendingUp } from "lucide-react"
import { DashboardLayout } from "../DashboardLayout"
import { CollegeRanking } from "@/lib/types"

const CollegesPage = () => {
  const [colleges, setColleges] = useState<CollegeRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setIsLoading(true)

        const res = await fetch("/api/colleges/kcet", {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Failed to fetch colleges")

        const data = await res.json()
        setColleges(data.colleges || [])
      } catch (err) {
        console.error(err)
        setColleges([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchColleges()
  }, [])

  const avgMostCompetitive = Math.round(
    colleges.reduce((sum, c) => sum + c.mostCompetitiveRank, 0) /
      (colleges.length || 1)
  )

  const avgLeastCompetitive = Math.round(
    colleges.reduce((sum, c) => sum + c.leastCompetitiveRank, 0) /
      (colleges.length || 1)
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Explore Colleges
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and compare colleges ranked by competitiveness
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : (
            <>
              <StatCard
                title="Total Colleges"
                value={colleges.length}
                icon={Building2}
                // subtitle="In database"
              />
              <StatCard
                title="Top College"
                value={colleges[0]?.collegeName.split(" ")[0] || "-"}
                icon={Trophy}
                // subtitle={`Rank ${
                //   colleges[0]?.mostCompetitiveRank?.toLocaleString() || "-"
                // }`}
              />
              <StatCard
                title="Avg. Top Cutoff"
                value={avgMostCompetitive.toLocaleString()}
                icon={TrendingUp}
                // subtitle="Most competitive courses"
              />
              <StatCard
                title="Avg. Lowest Cutoff"
                value={avgLeastCompetitive.toLocaleString()}
                icon={TrendingDown}
                // subtitle="Least competitive courses"
              />
            </>
          )}
        </div>

        {/* Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <CompetitivenessRangeChart colleges={colleges} />
        )}

        {/* Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <CollegeRankTable colleges={colleges} />
        )}
      </div>
    </DashboardLayout>
  )
}

export default CollegesPage
