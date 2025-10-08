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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Search, BookOpen, Users, Trophy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form } from "@/components/ui/form"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { ExamTypeEnum, type ExamType } from "@/lib/types"
import { getValidationSchema, type kcetSchema, type comedkSchema, type jeeSchema } from "@/lib/validation"

const examInfo = {
  kcet: { name: "KCET", description: "Karnataka Common Entrance Test" },
  comedk: { name: "COMEDK", description: "Consortium of Medical, Engineering and Dental Colleges" },
  jee: { name: "JEE", description: "Joint Entrance Examination" },
}

type ExamFormData = z.infer<typeof kcetSchema> | z.infer<typeof comedkSchema> | z.infer<typeof jeeSchema>

export default function Home() {
  const [selectedExam, setSelectedExam] = useState<ExamType>("kcet")
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
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: SchemaType) => {
      const queryParams = new URLSearchParams()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined && value !== ("ALL" as any)) {
          const apiKey = key === "instituteType" ? "institute-type" : key === "category" ? "cat" : key
          queryParams.append(apiKey, value.toString())
        }
      })
      const response = await axios.get(`/api/exams/${(data as any).exam}?${queryParams.toString()}`)
      return response.data
    },
    onSuccess: (data, variables) => {
      const queryParams = new URLSearchParams()
      Object.entries(variables).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined && value !== ("ALL" as any)) {
          const uiKey = key === "category" ? "cat" : key
          queryParams.append(uiKey, value.toString())
        }
      })
      sessionStorage.setItem("predictionResults", JSON.stringify(data))
      router.push(`/dashboard/results?${queryParams.toString()}`)
    },
  })

  const onSubmit = (data: z.infer<typeof schema>) => mutation.mutate(data)

  const handleExamChange = (exam: ExamType) => {
    setSelectedExam(exam)
    const baseDefaults: Partial<SchemaType> = {
      exam,
      rank: undefined,
      category: "",
      round: undefined,
      course: undefined,
    }
    if (exam === "kcet") {
      form.reset({ ...baseDefaults, hk: undefined, rural: undefined, kannada: undefined })
    } else if (exam === "jee") {
      form.reset({ ...baseDefaults, pwd: undefined, state: "", gender: undefined, instituteType: undefined })
    } else {
      form.reset(baseDefaults)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">Find Your Dream College</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get accurate college predictions based on your rank and preferences for KCET, COMEDK, and JEE exams.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: BookOpen, title: "500+ Colleges", text: "Comprehensive database" },
          { icon: Users, title: "Real-time Data", text: "Updated cutoff ranks" },
          { icon: Trophy, title: "Accurate Predictions", text: "Advanced algorithms" },
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

      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">Get Your College Predictions</CardTitle>
          <CardDescription>Select your exam and enter your details to find matching colleges.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs
                value={selectedExam}
                onValueChange={(e)=>handleExamChange(e as ExamType)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value={ExamTypeEnum.KCET} className="w-full col-span-1">KCET</TabsTrigger>
                  <TabsTrigger value={ExamTypeEnum.COMEDK} className="w-full col-span-1">COMEDK</TabsTrigger>
                  <TabsTrigger value={ExamTypeEnum.JEE} className="w-full col-span-1">JEE</TabsTrigger>
                  <div /> 
                </TabsList>

                <TabsContent value="kcet" className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Karnataka Common Entrance Test
                  </h3>
                </TabsContent>

                <TabsContent value="comedk" className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Consortium of Medical, Engineering and Dental Colleges
                  </h3>
                </TabsContent>

                <TabsContent value="jee" className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Joint Entrance Examination
                  </h3>
                </TabsContent>
              </Tabs>

              <FormFields examType={selectedExam} />

              {mutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {axios.isAxiosError(mutation.error)
                      ? mutation.error.response?.data?.message || "Failed to fetch predictions."
                      : "An unexpected error occurred. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button type="submit" size="lg" disabled={mutation.isPending} className="px-10">
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Predictions...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> Get College Predictions
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
