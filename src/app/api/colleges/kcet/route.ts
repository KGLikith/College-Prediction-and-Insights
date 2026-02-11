import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  try {
    const apiUrl = `${BACKEND_URL}/api/colleges/kcet`;

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
    console.error("[API ERROR] KCET Colleges:", error.message);

    if (error.response) {
      return NextResponse.json(
        {
          message:
            error.response.data?.message ||
            "Backend error while fetching colleges",
          status: "error",
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch KCET colleges",
        status: "error",
      },
      { status: 500 }
    );
  }
}
