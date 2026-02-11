"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Menu, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CalendarTimeline } from "./tables/calendarTimeTable"

interface Message {
  role: "user" | "assistant"
  text: string
}

type CalendarItem = {
  number: string;
  event: string;
  date: string;
};


function autoFixLists(text: string) {
  return text.replace(/(\d+\.\s\*\*.*?\*\*:\n)/g, "$1\n");
}



function parseCalendarTable(text: string): CalendarItem[] | null {
  const tableRegex = /\|\s*No\.\s*\|\s*Events\s*\|\s*Date\s*\|([\s\S]*?)$/;
  const match = text.match(tableRegex);

  if (!match) return null;

  const rows = match[1]
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .map((line): CalendarItem | null => {
      const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
      if (cols.length < 3) return null;

      return {
        number: cols[0],
        event: cols[1],
        date: cols[2],
      };
    })
    .filter((item): item is CalendarItem => item !== null);

  return rows.length ? rows : null;
}

const PRESET_QUESTIONS = [
  "A seat has been allotted in the first round what choices are available to me?",
  "Can you provide me with the calendar of events?",
  "Which documents do I need to submit for my application?",
]

const STORAGE_KEY = "kcet_chat_history"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px"
  }, [question])

  const askQuestion = async (q: string) => {
    if (!q.trim()) return

    setMessages((prev) => [...prev, { role: "user", text: q }])
    setQuestion("")
    setLoading(true)

    try {
      const res = await fetch(`/api/predictions/kcet/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      })

      if (!res.ok) throw new Error("Failed request")

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data?.answer ?? "No answer returned." },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I couldn't fetch an answer right now.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-neutral-50 dark:bg-neutral-950">

      <div className="fixed left-0 right-0 top-16 z-30 flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 lg:hidden">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
        </button>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          KCET Assistant
        </p>
        <div />
      </div>

      <div className="hidden w-80 border-r border-neutral-200 dark:border-neutral-800 lg:flex">
        <Sidebar askQuestion={askQuestion} disabled={loading} />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-neutral-50 shadow-xl dark:bg-neutral-950 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
                <p className="font-semibold text-neutral-900 dark:text-neutral-50">
                  KCET Assistant
                </p>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                </button>
              </div>

              <Sidebar
                askQuestion={(q) => {
                  askQuestion(q)
                  setSidebarOpen(false)
                }}
                disabled={loading}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m, idx) => {
              const isAssistant = m.role === "assistant";
              const calendar = isAssistant ? parseCalendarTable(m.text) : null;
              
              console.log("Rendered assistant text:", m.text);
              return (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm shadow-sm
        ${m.role === "user"
                        ? "max-w-sm sm:max-w-lg bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
                        : calendar
                          ? "max-w-2xl bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                          : "max-w-lg bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                      }`}
                  >
                    {isAssistant ? (
                      calendar ? (
                        <CalendarTimeline items={calendar} />
                      ) : (
                        <div
                          className="
                                prose prose-sm max-w-none
                                dark:prose-invert prose-neutral

                                prose-ol:list-decimal
                                prose-ol:pl-5

                                prose-ul:list-disc
                                prose-ul:pl-5

                                prose-li:my-1
                                prose-li:marker:font-semibold

                                prose-li>ul:mt-1
                                prose-li>ul:pl-4

                                prose-headings:mt-4
                                prose-headings:mb-2
                                prose-h3:text-sm
                                prose-h3:font-semibold
                              "
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {autoFixLists(m.text)}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              );
            })}


            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-neutral-200 px-4 py-3 dark:bg-neutral-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-end gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">

              <Textarea
                ref={textareaRef}
                placeholder="Ask a KCET-related question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey && !loading) {
                    e.preventDefault()
                    askQuestion(question)
                  }
                }}
                className="max-h-40 min-h-[36px] flex-1 resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
              />

              <Button
                size="sm"
                disabled={!question.trim() || loading}
                onClick={() => askQuestion(question)}
                className="h-8 px-3 text-xs bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>

            <p className="mt-1 text-[10px] text-neutral-500">
              Ctrl + Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ askQuestion, disabled }: { askQuestion: (q: string) => void, disabled: boolean  }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          KCET Assistant
        </h2>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          Ask questions about counselling
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-500">
          Suggested Questions
        </p>
        <div className="space-y-2">
          {PRESET_QUESTIONS.map((q) => (
            <Button
              key={q}
              variant="outline"
              className="h-auto w-full justify-start whitespace-normal bg-transparent p-3 text-left text-sm leading-relaxed text-neutral-900 transition-all hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
              onClick={() => askQuestion(q)}
              disabled={disabled}
            >
              {q}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
