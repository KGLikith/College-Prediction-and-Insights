"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  text: string
}

const PRESET_QUESTIONS = [
  "A seat has been allotted in the first round what choices are available to me?",
  "Can you provide me with the calendar of events?",
  "Which documents do I need to submit for my application?",
]

const STORAGE_KEY = "kcet_chat_history"
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://143.244.135.13:3000"

export default function KCETChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  /* Load chat history */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  /* Persist chat history */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const askQuestion = async (q: string) => {
    if (!q.trim()) return

    setMessages((prev) => [...prev, { role: "user", text: q }])
    setQuestion("")
    setLoading(true)

    try {
      const res = await fetch(`/api/predictions/kcet/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: q }),
      })

      if (!res.ok) {
        throw new Error("Failed request")
      }

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data?.answer ?? "No answer returned.",
        },
      ])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Sorry, I couldn’t fetch an answer right now. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-screen md:h-auto md:max-h-[650px] flex flex-col px-4 py-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          KCET Assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about KCET counselling
        </p>
      </div>

      {messages.length === 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Frequently asked questions
          </p>

          <div className="grid gap-2">
            {PRESET_QUESTIONS.map((q) => (
              <Button
                key={q}
                variant="outline"
                className="justify-start text-left h-auto p-3"
                onClick={() => askQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 border rounded-lg p-4 overflow-y-auto space-y-3 bg-muted/30">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${
              m.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Ask a KCET-related question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="resize-none"
        />

        <Button
          disabled={!question.trim() || loading}
          onClick={() => askQuestion(question)}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Ask Question"
          )}
        </Button>
      </div>
    </div>
  )
}
