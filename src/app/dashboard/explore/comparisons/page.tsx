"use client"

import React from "react"
import { 
  Building2, 
  GraduationCap, 
  History, 
  LineChart, 
  MapPin, 
  PieChart, 
  Target 
} from "lucide-react"

import { AnalyticsCard } from "./components/analytics-card"

const MODULES = [
  {
    title: "Category vs Category",
    description: "Compare reservation categories directly. Analyze Rank Gap Heatmap and Category Drift.",
    icon: Target,
    href: "/dashboard/explore/comparisons/category-vs-category",
    metricCount: 14,
    trending: true
  },
  {
    title: "College vs College",
    description: "Compare colleges deeply by branch, category, round, and year without fixed limits.",
    icon: Building2,
    href: "/dashboard/explore/comparisons/college-vs-college",
    metricCount: 8,
  },
  {
    title: "Course vs Course",
    description: "Compare engineering branches. Analyze demand migration, rank volatility, and growth.",
    icon: GraduationCap,
    href: "/dashboard/explore/comparisons/course-vs-course",
    metricCount: 12,
    trending: true
  },
  {
    title: "Year-wise Evolution",
    description: "Analyze historical cutoff evolution, detecting volatility and cutoff shocks over time.",
    icon: History,
    href: "/dashboard/explore/comparisons/year-evolution",
    metricCount: 6,
  },
  {
    title: "Prediction vs Historical",
    description: "Compare prediction model outputs against historical trends with confidence intervals.",
    icon: LineChart,
    href: "/dashboard/explore/comparisons/prediction-vs-history",
    metricCount: 5,
  },
  {
    title: "Round vs Round",
    description: "Analyze counseling round behavior, rank drift funnels, and opportunity gains.",
    icon: PieChart,
    href: "/dashboard/explore/comparisons/round-vs-round",
    metricCount: 4,
  },
  {
    title: "District & Quota Analytics",
    description: "Analyze quota impact and regional accessibility via competitiveness maps.",
    icon: MapPin,
    href: "/dashboard/explore/comparisons/quota-analytics",
    metricCount: 7,
  }
]

export default function AnalyticsHubPage() {
  return (
    <div className="space-y-10 pb-10">
      {/* Category Grid */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Exploration Modules
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Select a dimension to begin comparative analysis.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((module, index) => (
            <AnalyticsCard 
              key={module.title}
              {...module}
              delay={index * 0.05}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
