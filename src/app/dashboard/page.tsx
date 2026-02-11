"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Search,
  BookOpen,
  Users,
  Trophy,
  ArrowRight,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { FormFields } from "@/components/form-fields"
import { ExamTypeEnum, type ExamType } from "@/lib/types"
import { getValidationSchema } from "@/lib/validation"
import { DISTRICT_CODE_TO_NAME } from "@/lib/types"

export default function Page() {
  const router = useRouter()

  const [selectedExam, setSelectedExam] = useState<ExamType>("kcet")
  const [usePrediction, setUsePrediction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = useMemo(() => getValidationSchema(selectedExam), [selectedExam])
  type SchemaType = z.infer<typeof schema>

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      exam: selectedExam,
      rank: undefined,
      category: "",
      round: undefined,
      course: undefined,
      district: "ALL",
    },
  })

  const onSubmit = async (data: SchemaType) => {
    try {
      setIsLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()

      Object.entries(data).forEach(([key, value]) => {
        if (
          value !== "" &&
          value !== null &&
          value !== undefined &&
          value !== ("ALL" as any)
        ) {
          const apiKey =
            key === "instituteType"
              ? "institute-type"
              : key === "category"
              ? "cat"
              : key

          queryParams.append(apiKey, value.toString())
        }
      })

      const basePath = usePrediction ? "/api/predictions" : "/api/exams"

      const response = await axios.get(
        `${basePath}/${data.exam}?${queryParams.toString()}`
      )

      sessionStorage.setItem(
        usePrediction ? "predictionResults" : "results",
        JSON.stringify(response.data)
      )

      router.push(
        usePrediction
          ? `/dashboard/predictions?${queryParams.toString()}`
          : `/dashboard/results?${queryParams.toString()}`
      )
    } catch {
      setError("Failed to fetch results. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExamChange = (exam: ExamType) => {
    setSelectedExam(exam)

    form.reset({
      exam,
      rank: undefined,
      category: "",
      round: undefined,
      course: undefined,
      district: "ALL",
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">

        <div className="text-center space-y-4 mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-50">
            Find Your Dream College
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Accurate college predictions based on rank, category, and preferences
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">

          <Card
            className="group cursor-pointer border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300 bg-neutral-50 dark:bg-neutral-900/50"
            onClick={() => router.push("/dashboard/explore/colleges")}
          >
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <BookOpen className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              </div>
              <CardTitle className="text-lg text-neutral-900 dark:text-neutral-50">
                280+ Colleges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Browse all colleges and courses
              </p>
              <ArrowRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300 bg-neutral-50 dark:bg-neutral-900/50"
            onClick={() =>
              document.getElementById("prediction-form")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <Trophy className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              </div>
              <CardTitle className="text-lg text-neutral-900 dark:text-neutral-50">
                Smart Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Predict cutoffs using rank & category
              </p>
              <ArrowRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300 bg-neutral-50 dark:bg-neutral-900/50"
            onClick={() => router.push("/dashboard/preference")}
          >
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              </div>
              <CardTitle className="text-lg text-neutral-900 dark:text-neutral-50">
                Preference Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Strategically build your option entry list
              </p>
              <ArrowRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-300 bg-neutral-50 dark:bg-neutral-900/50"
            onClick={() => router.push("/dashboard/chat")}
          >
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              </div>
              <CardTitle className="text-lg text-neutral-900 dark:text-neutral-50">
                KCET Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Ask questions about KCET counselling
              </p>
              <ArrowRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardContent>
          </Card>
        </div>

        <Card
          id="prediction-form"
          className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"
        >
          <CardHeader className="text-center border-b border-neutral-200 dark:border-neutral-800 ">
            <CardTitle className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Get College Predictions
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Enter your exam details to see eligible colleges
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2 flex flex-col items-center">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 flex flex-col items-center w-full">

                <div className="flex justify-center items-center">
                  <Tabs
                    value={selectedExam}
                    onValueChange={(v) => handleExamChange(v as ExamType)}
                    className="w-full max-w-md"
                  >
                    <TabsList className="grid grid-cols-3 bg-neutral-200 dark:bg-neutral-800">
                      <TabsTrigger value={ExamTypeEnum.KCET}>KCET</TabsTrigger>
                      {/* <TabsTrigger value={ExamTypeEnum.COMEDK}>COMEDK</TabsTrigger>
                      <TabsTrigger value={ExamTypeEnum.JEE}>JEE</TabsTrigger> */}
                    </TabsList>
                    <TabsContent value={selectedExam} />
                  </Tabs>
                </div>

                <div className="max-w-3xl mx-auto grid gap-6">
                  <FormFields examType={selectedExam} />
                </div>

                {selectedExam !== "jee" && (
                  <div className="max-w-sm mx-auto">
                    <Label className="mb-2 block text-neutral-700 dark:text-neutral-300 font-medium">
                      Preferred District
                    </Label>
                    <Select
                      value={form.watch("district")}
                      onValueChange={(v) => form.setValue("district", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Districts" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DISTRICT_CODE_TO_NAME).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="max-w-md mx-auto flex items-center gap-4 justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-5 py-4 bg-neutral-100 dark:bg-neutral-800">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                      AI-based Prediction
                    </p>
                    <p className="text-xs text-neutral-500">
                      Use predictive cutoff estimation
                    </p>
                  </div>
                  <Checkbox
                    checked={usePrediction}
                    onCheckedChange={(v) => setUsePrediction(Boolean(v))}
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="max-w-md mx-auto">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold px-12 h-12"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Get Predictions
                      </>
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
