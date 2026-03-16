/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  req: Request,
  context: { params: Promise<{ college_code: string }> }
) {
  const { college_code } = await context.params;

  if (!college_code) {
    return NextResponse.json(
      { message: "College code is required" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const courseCode = searchParams.get("course_code");
  const category = searchParams.get("cat");

  if (!courseCode || !category) {
    return NextResponse.json(
      { message: "Course code and category are required" },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `${BACKEND_URL}/api/colleges/kcet/${college_code}/cutoff-vs-year?course_code=${courseCode}&cat=${category}`;

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(response.data, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error(`[API ERROR] Cutoff vs Year for ${college_code}:`, error.message);

    if (error.response) {
      return NextResponse.json(
        {
          message:
            error.response.data?.message ||
            "Backend error while fetching cutoff vs year data",
          status: "error",
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch cutoff vs year data",
        status: "error",
      },
      { status: 500 }
    );
  }
}
