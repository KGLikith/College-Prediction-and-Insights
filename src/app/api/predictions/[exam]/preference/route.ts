import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_PREF_URL


export async function POST(req: Request) {
  try {
    const body = await req.json()

    const apiUrl = `${BACKEND_URL}/api/predictions/kcet/preferences`

    const backendRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify(body),
      }
    )

    const data = await backendRes.json()

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
