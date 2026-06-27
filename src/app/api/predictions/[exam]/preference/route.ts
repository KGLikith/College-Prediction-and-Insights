import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_PREF_URL

export async function POST(req: Request) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      )
    }

    const body = await req.json()

    const apiUrl = `${BACKEND_URL}/api/predictions/kcet/preferences`

    const backendRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const text = await backendRes.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      // Backend returned a non-JSON body (often an error page); surface it.
      return NextResponse.json(
        { error: "Backend returned an invalid response", details: text },
        { status: backendRes.ok ? 502 : backendRes.status }
      )
    }

    return NextResponse.json(data, {
      status: backendRes.status,
    })
  } catch (error) {
    console.error("Proxy error:", error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
