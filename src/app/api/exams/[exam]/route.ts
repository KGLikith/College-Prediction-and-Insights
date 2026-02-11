import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(req: Request, context: { params: Promise<{ exam: string }> }) {
  const { exam } = await context.params;

  if (!exam || !["kcet", "comedk", "jee"].includes(exam)) {
    return NextResponse.json({ message: "Invalid exam type" }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const apiUrl = `${BACKEND_URL}/api/exams/${exam}?${queryString}&year=2024`;

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
    console.error("API Error:", error.message);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || "Backend API error",
          status: "error",
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch college predictions. Please try again.",
        status: "error",
      },
      { status: 500 }
    );
  }
}
