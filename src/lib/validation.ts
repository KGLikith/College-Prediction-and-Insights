import { z } from "zod";

const emptyToUndefined = (v: unknown) => {
  if (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)))
    return undefined;
  return v;
};


const baseSchema = z.object({
  exam: z.enum(["kcet", "comedk", "jee"]),
  rank: z.coerce
    .number({
      error: "Rank is required",
    })
    .min(1, "Rank must be at least 1")
    .max(1000000, "Rank cannot exceed 1,000,000")
    .refine((val) => Number.isInteger(val), { message: "Rank must be an integer" }),
  district: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  round: z.preprocess(emptyToUndefined, z.number().min(1).optional()),
  course: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().optional()
  ),
});

export const kcetSchema = baseSchema.extend({
  exam: z.literal("kcet"),
  category: z.enum([
    "GM",
    "1G",
    "2AG",
    "2BG",
    "3AG",
    "3BG",
    "SCG",
    "STG",
    "KKR",
  ], { error: "Category is required" }),
  round: z.preprocess(emptyToUndefined, z.number().min(1).max(3).optional()),
  hk: z.boolean().optional(),
  rural: z.boolean().optional(),
  kannada: z.boolean().optional(),
  district: z.string().optional(),
});

export const comedkSchema = baseSchema.extend({
  predict: z.boolean().optional(),
  district: z.string().optional(),
  category: z.enum(["GM", "KKR"], { error: "Category is required" }),
  round: z.preprocess(emptyToUndefined, z.number().min(1).max(4).optional()),
});

export const jeeSchema = baseSchema.extend({
  exam: z.literal("jee"),
  district: z.string().optional(),
  category: z.enum(["OPEN", "OBC-NCL", "EWS", "SC", "ST"], {
    error: "Category is required",
  }),

  round: z.preprocess(emptyToUndefined, z.number().min(1).max(4).optional()),
  pwd: z.boolean({ error: "PWD selection is required" }),
  state: z.string({ error: "State is required" }).min(1, "State is required"),
  gender: z.enum(["M", "F", "others"], { error: "Gender is required" }),
  instituteType: z.enum(["IIT", "NIT", "GFTIs"], {
    error: "Institute type is required",
  }),
});

export const getValidationSchema = (examType: string) => {
  switch (examType) {
    case "kcet":
      return kcetSchema;
    case "comedk":
      return comedkSchema;
    case "jee":
      return jeeSchema;
    default:
      return baseSchema;
  }
};
