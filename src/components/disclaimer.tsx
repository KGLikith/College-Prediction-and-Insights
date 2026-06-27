import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

const KEA_URL = "https://cetonline.karnataka.gov.in/kea/"

interface DisclaimerProps {
  variant?: "cutoff" | "statistical"
  className?: string
}

const KeaLink = () => (
  <a
    href={KEA_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="font-medium underline underline-offset-2 hover:opacity-80"
  >
    official KEA website
  </a>
)

const CONTENT = {
  cutoff: (
    <>
      These results are based on <b>previous years&apos; cutoff data</b> and do{" "}
      <b>not guarantee seat allotment</b>. Actual cutoffs change every year with
      the seat matrix, number of applicants and counselling rounds. Always refer
      to the <KeaLink /> for official information.
    </>
  ),
  statistical: (
    <>
      These predictions are derived from <b>statistical analysis of historical
      data</b> and are <b>not the actual counselling result</b>. They are
      indicative estimates only and we cannot guarantee their accuracy. Please
      refer to the <KeaLink /> for confirmed cutoffs and seat allotment.
    </>
  ),
}

export function Disclaimer({ variant = "cutoff", className }: DisclaimerProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="leading-relaxed [&_b]:font-semibold">{CONTENT[variant]}</p>
    </div>
  )
}
