"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Filter, MapPin, GraduationCap, Building2, Calendar, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const filterCategories = [
  { id: "categories", label: "Categories", icon: Target, count: 2 },
  { id: "colleges", label: "Colleges", icon: Building2, count: 0 },
  { id: "courses", label: "Courses", icon: GraduationCap, count: 3 },
  { id: "districts", label: "Districts", icon: MapPin, count: 0 },
  { id: "years", label: "Years & Rounds", icon: Calendar, count: 1 },
]

export function AnalyticsSidebar() {
  const [activeSection, setActiveSection] = useState<string>("categories")

  return (
    <div className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white/40 dark:border-neutral-800 dark:bg-neutral-950/40 md:flex">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <Filter className="h-3.5 w-3.5" />
          Query Builder
        </h3>
        <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
          Refine your analytics parameters
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {filterCategories.map((cat) => {
          const isActive = activeSection === cat.id
          const Icon = cat.icon
          
          return (
            <div key={cat.id} className="px-2 py-1">
              <button
                onClick={() => setActiveSection(cat.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-neutral-400"}`} />
                  <span className="font-medium">{cat.label}</span>
                </div>
                {cat.count > 0 ? (
                  <Badge variant={isActive ? "default" : "secondary"} className="h-5 min-w-5 justify-center px-1 text-[10px]">
                    {cat.count}
                  </Badge>
                ) : (
                  <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? "rotate-90 text-blue-500" : "text-neutral-300 dark:text-neutral-600"}`} />
                )}
              </button>
              
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden px-3 py-2"
                >
                  <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                    {cat.id === "categories" && (
                      <div className="flex flex-col gap-2 p-1">
                        {["GM", "SCG", "STG", "2AG", "3AG", "1G"].map((c) => (
                          <label key={c} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-blue-600 dark:border-neutral-700" defaultChecked={["GM", "SCG"].includes(c)} />
                            <span className="text-xs font-medium">{c}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {cat.id === "colleges" && (
                      <div className="flex flex-col gap-3 p-1">
                        <input type="text" placeholder="Search college..." className="w-full rounded-md border border-neutral-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900" />
                        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                          {[
                            { id: "E005", name: "R. V. College of Engineering, Bangalore(AUTONOMOUS) R.V. VIDYANIKETAN POST, MYSORE ROAD,BANGALORE" },
                            { id: "E009", name: "PES University 100 Feet Ring Road, Banashankari, 3rd Stage, Hosakerehalli, Near DSERT, , Bangalore KARNATAKA, pin code -560085" },
                            { id: "E006", name: "M S Ramaiah Institute of Technology, Bangalore(AUTONOMOUS) VIDYA SOUDHA,MSR NAGAR,MSRIT POST,BANGALORE - 560054." },
                            { id: "E001", name: "University of Visvesvaraya College of Engineering Bangalore" },
                            { id: "E057", name: "JSS Science and Technology University(Formerly SJCE) Mysore" }
                          ].map((c) => (
                            <label key={c.id} className={`group relative flex cursor-pointer flex-col gap-1 rounded-md border p-2 transition-colors ${c.id === "E005" ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20" : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"}`}>
                              <input type="checkbox" className="peer sr-only" defaultChecked={c.id === "E005"} />
                              <div className="flex items-start justify-between gap-2">
                                <span className="line-clamp-2 text-[11px] font-medium leading-snug text-neutral-800 dark:text-neutral-200">{c.name}</span>
                                <div className="mt-0.5 hidden h-3 w-3 rounded-full bg-blue-500 peer-checked:block" />
                              </div>
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{c.id}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {cat.id === "courses" && (
                      <div className="flex flex-col gap-3 p-1">
                        <input type="text" placeholder="Search course..." className="w-full rounded-md border border-neutral-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900" />
                        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                          {[
                            { id: "BT", name: "BT Bio Technology" },
                            { id: "CA", name: "CA CS (AI, Machine Learning)" },
                            { id: "CE", name: "CE Civil" },
                            { id: "CH", name: "CH Chemical" },
                            { id: "CS", name: "CS Computer Science" }
                          ].map((c) => (
                            <label key={c.id} className={`group relative flex cursor-pointer flex-col gap-1 rounded-md border p-2 transition-colors ${c.id === "CS" ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20" : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"}`}>
                              <input type="checkbox" className="peer sr-only" defaultChecked={c.id === "CS"} />
                              <div className="flex items-start justify-between gap-2">
                                <span className="truncate text-[11px] font-medium text-neutral-800 dark:text-neutral-200">{c.name}</span>
                                <div className="mt-0.5 hidden h-3 w-3 rounded-full bg-blue-500 peer-checked:block" />
                              </div>
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{c.id}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {cat.id === "districts" && (
                      <div className="flex flex-col gap-2 p-1">
                        {["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Tumakuru"].map((c) => (
                          <label key={c} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-blue-600 dark:border-neutral-700" defaultChecked={c === "Bengaluru"} />
                            <span className="text-xs font-medium">{c}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {cat.id === "years" && (
                      <div className="flex flex-col gap-4 p-1">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Year Range</label>
                          <select className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900">
                            <option>2021 - 2024</option>
                            <option>2022 - 2024</option>
                            <option>2023 - 2024</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Target Rounds</label>
                          {["Round 1", "Round 2", "Round 3 (Mop-up)"].map((c) => (
                            <label key={c} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-blue-600 dark:border-neutral-700" defaultChecked />
                              <span className="text-xs font-medium">{c}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="relative border-t border-neutral-200 p-4 dark:border-neutral-800">
        <button 
          onClick={() => {
            const el = document.getElementById("toast-msg")
            if (el) {
              el.style.opacity = "1"
              el.style.transform = "translateY(0)"
              setTimeout(() => {
                el.style.opacity = "0"
                el.style.transform = "translateY(10px)"
              }, 3000)
            }
          }}
          className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus:ring-neutral-100 dark:focus:ring-offset-neutral-950"
        >
          Apply Filters
        </button>
        <button className="mt-3 w-full text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-300">
          Reset all to default
        </button>

        {/* Custom Toast Message */}
        <div 
          id="toast-msg" 
          className="absolute -top-12 left-1/2 -translate-x-1/2 translate-y-2.5 whitespace-nowrap rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 dark:bg-neutral-100 dark:text-neutral-900 pointer-events-none"
        >
          Filters applied successfully!
        </div>
      </div>
    </div>
  )
}

