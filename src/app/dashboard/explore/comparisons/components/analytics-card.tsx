"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface AnalyticsCardProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
  metricCount?: number
  trending?: boolean
  delay?: number
}

export function AnalyticsCard({ title, description, icon: Icon, href, metricCount, trending, delay = 0 }: AnalyticsCardProps) {
  return (
    <Link href={href} className="block w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        whileHover={{ y: -4, scale: 1.01 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-blue-700 dark:hover:bg-neutral-900"
      >
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-linear-to-br from-blue-100/50 to-purple-100/50 blur-2xl transition-opacity group-hover:opacity-100 dark:from-blue-900/20 dark:to-purple-900/20" />
        
        <div className="relative flex flex-1 flex-col">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Icon className="h-5 w-5" />
            </div>
            {trending && (
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                </span>
                Trending
              </div>
            )}
          </div>
          
          <h3 className="mb-1 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <p className="mb-6 flex-1 text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
          
          <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800/60">
            <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              {metricCount ? `${metricCount} metrics available` : "Explore analytics"}
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-blue-900/50 dark:group-hover:text-blue-400">
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
