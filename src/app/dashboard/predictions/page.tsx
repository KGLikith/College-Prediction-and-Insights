import { Suspense } from "react"
import Prediction from "./prediction"

export default function PredictionsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <Prediction />
    </Suspense>
  )
}
