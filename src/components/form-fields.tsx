"use client"

import { useFormContext } from "react-hook-form"
import { INDIAN_STATES, COURSE_CATEGORIES } from "@/lib/types"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

type Props = {
  examType: "kcet" | "comedk" | "jee"
}

const CATEGORY_OPTIONS: Record<string, string[]> = {
  kcet: ["GM", "1G", "2AG", "2BG", "3AG", "3BG", "SCG", "STG", "KKR"],
  comedk: ["GM", "KKR"],
  jee: ["OPEN", "OBC-NCL", "EWS", "SC", "ST"],
}

const ROUND_OPTIONS: Record<Props["examType"], string[]> = {
  kcet: ["1", "2", "3"],
  comedk: ["1", "2", "3", "4"],
  jee: ["1", "2", "3", "4"],
}

export function FormFields({ examType }: Props) {
  const form = useFormContext()
  if (!form) return null

  const isJEE = examType === "jee"

  return (
    <div className="w-full space-y-12">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">

        <FormField
          control={form.control}
          name="rank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Rank <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Rank"
                  min={1}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? undefined : Number(e.target.value)
                    field.onChange(val && val > 0 ? val : undefined)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_OPTIONS[examType].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="round"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Round</FormLabel>
              <Select
                value={String(field.value || "ALL")}
                onValueChange={(v) =>
                  field.onChange(v === "ALL" ? undefined : Number(v))
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ALL" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ALL">ALL</SelectItem>
                  {ROUND_OPTIONS[examType].map((r) => (
                    <SelectItem key={r} value={r}>
                      Round {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Course</FormLabel>
              <Select
                value={(field.value as string) || "ALL"}
                onValueChange={(v) =>
                  field.onChange(v === "ALL" ? undefined : v)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ALL" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  <SelectItem value="ALL">ALL</SelectItem>
                  {Object.entries(COURSE_CATEGORIES).map(
                    ([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name} ({code})
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {examType === "kcet" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-base">
              Additional KCET Details
            </h3>
            <p className="text-sm text-muted-foreground">
              Select if any apply
            </p>
          </div>

          <div className="flex gap-10">
            {["hk", "rural", "kannada"].map((name) => (
              <FormField
                key={name}
                control={form.control}
                name={name as any}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(c) => field.onChange(!!c)}
                      />
                    </FormControl>
                    <FormLabel className="font-normal capitalize">
                      {name}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      )}

      {isJEE && (
        <div className="space-y-10">

          <h3 className="font-semibold text-base">
            Additional JEE Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gender <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>
      )}
    </div>
  )
}
