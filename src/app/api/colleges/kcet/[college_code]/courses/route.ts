import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  req: Request,
  context: { params: Promise<{ college_code: string }> }
) {
  const { college_code } = await context.params;

  console.log("hello")

  if (!college_code) {
    return NextResponse.json(
      { message: "College code is required" },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `${BACKEND_URL}/api/colleges/kcet/${college_code}/courses`;

    console.log(`[API] Fetching courses for college: ${college_code}`);

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
    console.error("[API ERROR] Courses:", error.message);

    if (error.response) {
      return NextResponse.json(
        {
          message:
            error.response.data?.message ||
            "Backend error while fetching courses",
          status: "error",
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch college courses",
        status: "error",
      },
      { status: 500 }
    );
  }
}
