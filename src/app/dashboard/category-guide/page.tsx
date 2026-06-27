import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Disclaimer } from "@/components/disclaimer"

export const metadata: Metadata = {
  title: "KCET Category Guide",
  description:
    "Understand KCET category codes — reservation categories combined with special quotas like Kannada Medium, Rural and Hyderabad-Karnataka.",
}

const SPECIAL_QUOTA = [
  { code: "G", label: "General" },
  { code: "K", label: "Kannada Medium Quota" },
  { code: "R", label: "Rural Quota" },
  { code: "H", label: "Hyderabad-Karnataka (Kalyana Karnataka) Quota" },
]

const RESERVATION = [
  { code: "GM", label: "General Merit" },
  { code: "1", label: "Category 1" },
  { code: "2A", label: "Category 2A" },
  { code: "2B", label: "Category 2B" },
  { code: "3A", label: "Category 3A" },
  { code: "3B", label: "Category 3B" },
  { code: "SC", label: "Scheduled Caste" },
  { code: "ST", label: "Scheduled Tribe" },
]

const QUOTA_SUFFIXES: { suffix: string; parts: string[] }[] = [
  { suffix: "K", parts: ["Kannada Medium Quota"] },
  { suffix: "R", parts: ["Rural Quota"] },
  { suffix: "H", parts: ["Hyderabad-Karnataka Quota"] },
  { suffix: "KH", parts: ["Kannada Medium Quota", "Hyderabad-Karnataka Quota"] },
  { suffix: "RH", parts: ["Rural Quota", "Hyderabad-Karnataka Quota"] },
]

type Row = { code: string; meaning: string }

const buildRows = (cat: { code: string; label: string }): Row[] => {
  // General Merit ("GM") already means General — its suffixes attach directly.
  // Every other reservation category appends "G" for the General quota.
  const rows: Row[] =
    cat.code === "GM"
      ? [{ code: "GM", meaning: "General Merit" }]
      : [{ code: `${cat.code}G`, meaning: `${cat.label} + General` }]

  for (const q of QUOTA_SUFFIXES) {
    rows.push({
      code: `${cat.code}${q.suffix}`,
      meaning: [cat.label, ...q.parts].join(" + "),
    })
  }
  return rows
}

export default function CategoryGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          KCET Category Guide
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
          KCET category codes combine a <b>reservation category</b> with one or
          more <b>special quotas</b>. Use this guide to understand what each code
          on this website means.
        </p>
      </div>

      <Disclaimer variant="statistical" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RESERVATION.map((r) => (
              <div key={r.code} className="flex items-center gap-3 text-sm">
                <Badge variant="secondary" className="font-mono w-12 justify-center">
                  {r.code}
                </Badge>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {r.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Special Quota Codes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SPECIAL_QUOTA.map((q) => (
              <div key={q.code} className="flex items-center gap-3 text-sm">
                <Badge variant="secondary" className="font-mono w-12 justify-center">
                  {q.code}
                </Badge>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {q.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to read a code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          <p>
            A code is the reservation category followed by its special quota
            letters. For example:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <b className="font-mono">GMR</b> → General Merit + Rural Quota
            </li>
            <li>
              <b className="font-mono">2AKH</b> → Category 2A + Kannada Medium
              Quota + Hyderabad-Karnataka Quota
            </li>
            <li>
              <b className="font-mono">SCG</b> → Scheduled Caste + General
            </li>
          </ul>
          <p className="text-neutral-500 dark:text-neutral-400">
            Note: <b className="font-mono">GM</b> on its own means General Merit,
            so the General quota letter (G) is not repeated for it.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Full reference
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {RESERVATION.map((cat) => (
            <Card key={cat.code}>
              <CardHeader>
                <CardTitle className="text-lg">{cat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {buildRows(cat).map((row) => (
                    <div
                      key={row.code}
                      className="flex items-start gap-3 py-2 text-sm"
                    >
                      <Badge
                        variant="outline"
                        className="font-mono shrink-0 w-16 justify-center"
                      >
                        {row.code}
                      </Badge>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {row.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
