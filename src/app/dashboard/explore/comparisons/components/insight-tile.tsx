import React from "react"

interface InsightTileProps {
  title: string
  value: string | React.ReactNode
  meaning: string
  calculation: string
  interpretation: string
}

export function InsightTile({ title, value, meaning, calculation, interpretation }: InsightTileProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
      <h4 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{title}</h4>
      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{value}</div>
      <div className="mt-2 flex flex-col gap-1 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        <p><strong className="text-neutral-700 dark:text-neutral-300">Means:</strong> {meaning}</p>
        <p><strong className="text-neutral-700 dark:text-neutral-300">Calc:</strong> {calculation}</p>
        <p className="mt-1 rounded bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <strong className="text-blue-800 dark:text-blue-200">Interpret:</strong> {interpretation}
        </p>
      </div>
    </div>
  )
}
