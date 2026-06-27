import type { College } from "@/lib/types"

const escapeCell = (value: unknown): string => {
  const str = value === null || value === undefined ? "" : String(value)
  // Wrap in quotes if the value contains a comma, quote, or newline.
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Builds a CSV string from a list of colleges and triggers a browser download.
 * No-op on the server (guards on `window`).
 */
export function exportCollegesToCsv(
  colleges: College[],
  filename = "kcet-results.csv"
): void {
  if (typeof window === "undefined" || colleges.length === 0) return

  const headers = [
    "College ID",
    "College Name",
    "Course",
    "Category",
    "Round",
    "Year",
    "Cutoff Rank",
    "GM Rank",
    "Chance",
  ]

  const rows = colleges.map((c) =>
    [
      c.collegeID,
      c.collegeName,
      c.course,
      c.category,
      c.round,
      c.year,
      c.cutoffRank,
      c.gmRank,
      c.chances,
    ]
      .map(escapeCell)
      .join(",")
  )

  const csv = [headers.map(escapeCell).join(","), ...rows].join("\n")

  // Prepend BOM so Excel reads UTF-8 correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
