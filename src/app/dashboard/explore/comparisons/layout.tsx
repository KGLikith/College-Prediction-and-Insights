"use client"

import React from "react"
import { motion } from "framer-motion"
import { AnalyticsToolbar } from "./components/analytics-toolbar"

export default function ComparisonsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* <AnalyticsToolbar /> */}

      <div className="flex flex-1 overflow-hidden">
        {/* Main Analytics Content Area */}
        <motion.div
          key="comparisons-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
