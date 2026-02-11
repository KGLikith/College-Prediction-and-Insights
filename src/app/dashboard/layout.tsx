"use client"

import React from "react"

import { motion } from "framer-motion"
import Header from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 scrollbar-hidden overflow-y-auto">
      <Header />

      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full"
      >
        {children}
      </motion.main>
    </div>
  )
}
