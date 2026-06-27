import { getCourseCode, type College } from "@/lib/types"

export interface ShortlistItem {
  college_code: string
  college_name: string
  course_code: string
  course_name: string
}

const KEY = "kcet_shortlist"

export const shortlistKey = (collegeCode: string, courseCode: string) =>
  `${collegeCode}::${courseCode}`

export function getShortlist(): ShortlistItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ShortlistItem[]) : []
  } catch {
    return []
  }
}

function save(items: ShortlistItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // Best-effort; ignore storage failures (e.g. private mode).
  }
}

export function collegeToShortlistItem(college: College): ShortlistItem {
  return {
    college_code: college.collegeID,
    college_name: college.collegeName,
    course_name: college.course,
    course_code: getCourseCode(college.course),
  }
}

/** Adds the item if absent, removes it if present. Returns true if now added. */
export function toggleShortlist(item: ShortlistItem): boolean {
  const items = getShortlist()
  const idx = items.findIndex(
    (i) =>
      i.college_code === item.college_code && i.course_code === item.course_code
  )
  if (idx >= 0) {
    items.splice(idx, 1)
    save(items)
    return false
  }
  items.push(item)
  save(items)
  return true
}

export function clearShortlist() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Best-effort.
  }
}
