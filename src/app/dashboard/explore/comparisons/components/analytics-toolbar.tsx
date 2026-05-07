"use client"

import React from "react"
import { Search, Filter, Settings2, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AnalyticsToolbar() {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Left Section: Context */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <BarChart2 className="h-4 w-4" />
            </div>
            <h2 className="hidden text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 sm:block">
              Analytics Hub (KCET)
            </h2>
          </div>
        </div>

        {/* Right Section: Quick Actions & Search */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="relative hidden lg:block">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <input
              type="text"
              placeholder="Search analytics..."
              className="h-8 w-48 rounded-md border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-blue-500"
            />
          </div>
          
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs hidden sm:flex">
            <Settings2 className="h-3.5 w-3.5" />
            Presets
          </Button>
          
          <Button variant="default" size="sm" className="h-8 gap-1 text-xs">
            <Filter className="h-3.5 w-3.5" />
            Compare
          </Button>
        </div>
      </div>
    </div>
  )
}

