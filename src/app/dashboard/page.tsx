"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import type { z } from "zod"

import { FormFields } from "@/components/form-fields"
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

import { ExamTypeEnum, type ExamType } from "@/lib/types"
import { getValidationSchema } from "@/lib/validation"
import { DISTRICT_CODE_TO_NAME } from "@/lib/types"

export default function Home() {
  const [selectedExam, setSelectedExam] = useState<ExamType>("kcet")
  const [usePrediction, setUsePrediction] = useState(false)
  const router = useRouter()

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
      district: "ALL"
    }, 
  })

  const mutation = useMutation({
    mutationFn: async (data: SchemaType) => {
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

      const basePath = usePrediction
        ? "/api/predictions"
        : "/api/exams"

      const response = await axios.get(
        `${basePath}/${data.exam}?${queryParams.toString()}`
      )

      return {
        data: response.data,
        query: queryParams.toString(),
      }
    },

    onSuccess: ({ data, query }) => {
      sessionStorage.setItem(
        usePrediction ? "predictionResults" : "results",
        JSON.stringify(data)
      )

      router.push(
        usePrediction
          ? `/dashboard/predictions?${query}`
          : `/dashboard/results?${query}`
      )
    },
  })

  const onSubmit = (data: SchemaType) => mutation.mutate(data)

  /* ---------------- Exam Change ---------------- */
  const handleExamChange = (exam: ExamType) => {
    setSelectedExam(exam)

    const baseDefaults: Partial<SchemaType> = {
      exam,
      rank: undefined,
      category: "",
      round: undefined,
      course: undefined,
      district: "ALL",
    }

    if (exam === "kcet") {
      form.reset({
        ...baseDefaults,
        hk: undefined,
        rural: undefined,
        kannada: undefined,
      })
    } else if (exam === "jee") {
      form.reset({
        ...baseDefaults,
        pwd: undefined,
        state: "",
        gender: undefined,
        instituteType: undefined,
      })
    } else {
      form.reset(baseDefaults)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Find Your Dream College
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Accurate college predictions based on rank, category, and preferences.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: BookOpen, title: "500+ Colleges", text: "Comprehensive data" },
          { icon: Users, title: "Updated Cutoffs", text: "Latest rounds" },
          { icon: Trophy, title: "Smart Predictions", text: "Rank-based logic" },
        ].map(({ icon: Icon, title, text }) => (
          <Card key={title} className="text-center">
            <CardHeader>
              <Icon className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">
            Get College Predictions
          </CardTitle>
          <CardDescription>
            Enter your exam details to see eligible colleges.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Exam Tabs */}
              <Tabs
                value={selectedExam}
                onValueChange={(e) =>
                  handleExamChange(e as ExamType)
                }
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value={ExamTypeEnum.KCET}>KCET</TabsTrigger>
                  <TabsTrigger value={ExamTypeEnum.COMEDK}>COMEDK</TabsTrigger>
                  <TabsTrigger value={ExamTypeEnum.JEE}>JEE</TabsTrigger>
                </TabsList>
                <TabsContent value={selectedExam} />
              </Tabs>

              {/* Core Fields */}
              <FormFields examType={selectedExam} />

              {/* District (NOT for JEE) */}
              {selectedExam !== "jee" && (
                <div className="max-w-sm mx-auto">
                  <Label className="mb-2 block">Preferred District</Label>
                  <Select
                    value={form.watch("district")}
                    onValueChange={(v) =>
                      form.setValue("district", v as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DISTRICT_CODE_TO_NAME).map(
                        ([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Prediction Toggle */}
              <div className="flex items-center justify-center gap-2">
                <Checkbox
                  id="predict"
                  checked={usePrediction}
                  onCheckedChange={(v) =>
                    setUsePrediction(Boolean(v))
                  }
                />
                <Label htmlFor="predict">
                  Use predicted results
                </Label>
              </div>

              {/* Error */}
              {mutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to fetch results. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  disabled={mutation.isPending}
                  className="px-10"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
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
  )
}
