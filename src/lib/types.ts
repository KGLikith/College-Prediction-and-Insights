export type ExamType = "kcet" | "comedk" | "jee"
export enum ExamTypeEnum {
  KCET = "kcet",
  COMEDK = "comedk",
  JEE = "jee",
}


export interface BaseFormData {
  exam: ExamType
  rank: number
  category: string
  year?: number
  round?: number
  course?: string
}

export interface KCETFormData extends BaseFormData {
  exam: "kcet"
  category: "GM" | "1G" | "2AG" | "2BG" | "3AG" | "3BG" | "SCG" | "STG" | "KKR"
  hk?: boolean
  rural?: boolean
  kannada?: boolean
}

export interface COMEDKFormData extends BaseFormData {
  exam: "comedk"
  category: "GM" | "KKR"
}

export interface JEEFormData extends BaseFormData {
  exam: "jee"
  category: "OPEN" | "OBC-NCL" | "EWS" | "SC" | "ST"
  pwd: boolean
  state: string
  gender: "M" | "F" | "others"
  instituteType: "IIT" | "NIT" | "GFTIs"
}

export type FormData = KCETFormData | COMEDKFormData | JEEFormData

export interface College {
  collegeID: string
  collegeName: string
  course: string
  category: string
  year: number
  round: number
  cutoffRank: number
  gmRank: number
}

export interface APIResponse {
  colleges: College[]
  limit?: number
  page?: number
  message?: string
  status: string
}

// Course name to code mapping (reverse of what backend expects)
export const COURSE_NAME_TO_CODE = {
  "Computer Science": "CS",
  "Artificial Intelligence": "AI",
  Electrical: "EE",
  Electronics: "EC",
  Aerospace: "AS",
  Aeronautical: "AN",
  Mechanical: "ME",
  Civil: "CV",
  "Data Science": "DS",
  "Cyber Security": "CY",
  "Information Science": "IS",
  "Information Technology": "IT",
  Biotechnology: "BT",
  Biomedical: "BM",
  "Agricultural Engineering": "AG",
  "Robotics Engineering": "RO",
  Automotive: "AMT",
  Automobile: "AMB",
  Chemical: "CH",
  "Environmental Engineering": "EV",
  Mechatronics: "MT",
  "Textile Engineering": "TXT",
  Architecture: "ANP",
  Planning: "ANP",
  "Silk Technology": "ST",
  "Polymer Technology": "PT",
  "Petroleum Engineering": "PTR",
  "Mining Engineering": "MIN",
  "Pharmaceutical Engineering": "PM",
  VLSI: "VI",
  Design: "DSG",
  "Industrial Engineering": "IND",
  "Industrial Production": "IND",
  "Industrial Management": "IND",
  "Ceramics Engineering": "CR",
  "Marine Engineering": "MN",
  "Mathematics and Computing": "MC",
  Mathematics: "MTH",
  Physics: "PHY",
  "Metullurigical Engineering": "MTL",
  "Computational Mechanics": "CMP",
  "Food Engineering": "FO",
  Econmoics: "ECO",
  "Basic Science": "BS",
  "Printing Engineering": "PR",
  "Geological Engineering": "GE",
  "General Engineering": "GN",
  "Fashion Engineering": "FE",
  "Internet of Things": "IOT",
} as const

// Code to name mapping for form dropdown
export const COURSE_CATEGORIES = Object.fromEntries(
  Object.entries(COURSE_NAME_TO_CODE).map(([name, code]) => [code, name]),
) as Record<string, string>

// Helper function to get course code from full course name
export const getCourseCode = (courseName: string): string => {
  // Try exact match first
  if (COURSE_NAME_TO_CODE[courseName as keyof typeof COURSE_NAME_TO_CODE]) {
    return COURSE_NAME_TO_CODE[courseName as keyof typeof COURSE_NAME_TO_CODE]
  }

  // Try partial matching for complex course names
  const lowerCourseName = courseName.toLowerCase()

  if (lowerCourseName.includes("computer science") && lowerCourseName.includes("data science")) {
    return "DS"
  }
  if (lowerCourseName.includes("computer science") && lowerCourseName.includes("artificial intelligence")) {
    return "AI"
  }
  if (lowerCourseName.includes("computer science") && lowerCourseName.includes("cyber security")) {
    return "CY"
  }
  if (lowerCourseName.includes("computer science")) {
    return "CS"
  }
  if (lowerCourseName.includes("electronics") && lowerCourseName.includes("communication")) {
    return "EC"
  }
  if (lowerCourseName.includes("information technology")) {
    return "IT"
  }
  if (lowerCourseName.includes("mechanical")) {
    return "ME"
  }
  if (lowerCourseName.includes("electrical")) {
    return "EE"
  }
  if (lowerCourseName.includes("civil")) {
    return "CV"
  }
  if (lowerCourseName.includes("biotechnology")) {
    return "BT"
  }

  // Return first two letters as fallback
  return courseName.substring(0, 2).toUpperCase()
}

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]
