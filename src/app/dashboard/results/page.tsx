import { Suspense } from "react"
import FlatResultsClient from "./result"

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <FlatResultsClient />
    </Suspense>
  )
}
