"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, ChevronDown, Check } from "lucide-react"

interface College {
  id: string
  name: string
}

interface SearchableCollegeSelectProps {
  colleges: College[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
}

export function SearchableCollegeSelect({ colleges, value, onChange, placeholder = "Select a college..." }: SearchableCollegeSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selectedCollege = colleges.find(c => c.id === value)

  // Filter colleges based on search
  const filteredColleges = colleges.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full sm:w-[300px]" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
      >
        <span className="truncate">{selectedCollege ? `${selectedCollege.id} - ${selectedCollege.name}` : placeholder}</span>
        <ChevronDown className="h-4 w-4 text-neutral-400 opacity-50" />
      </button>

      {open && (
        <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center border-b border-neutral-100 px-3 dark:border-neutral-800">
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name or CET code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent px-2 py-2 text-xs font-medium outline-none placeholder:text-neutral-500 dark:text-neutral-200"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filteredColleges.length === 0 ? (
              <div className="py-2 text-center text-xs text-neutral-500">No colleges found.</div>
            ) : (
              filteredColleges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onChange(c.id)
                    setOpen(false)
                    setSearchTerm("")
                  }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    value === c.id ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <span className="truncate">{c.id} - {c.name}</span>
                  {value === c.id && <Check className="h-3 w-3" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
