import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_RAG_URL

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const apiUrl = `${BACKEND_URL}/query`

    const question: string | undefined = body?.question

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Invalid question provided" },
        { status: 400 }
      )
    }

    const externalRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    })

    if (!externalRes.ok) {
      const errorText = await externalRes.text()
      console.error("External API error:", errorText)
      return NextResponse.json(
        {
          error: "External API error",
          details: errorText,
        },
        { status: externalRes.status }
      )
    }

    const data = await externalRes.json()

    return NextResponse.json({
      answer: data?.answer ?? "No answer returned.",
    })
  } catch (error) {
    console.error("KCET Chat API Error:", error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
