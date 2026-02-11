"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { useEffect, useState } from "react"
import clsx from "clsx"

const NAV_ITEMS = [
  { label: "Predictions", href: "/dashboard/#prediction-form", link: "/dashboard/results" },
  { label: "Last Year Results", href: "/dashboard/#prediction-form", link: "/dashboard/predictions" },
  { label: "Explore Colleges", href: "/dashboard/explore/colleges", link: "/dashboard/explore/colleges" },
  { label: "KCET Assistant", href: "/dashboard/chat", link: "/dashboard/chat" },
  { label: "Preference Order", href: "/dashboard/preference", link: "/dashboard/preference" },
]

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isDashboard = pathname.startsWith("/dashboard")
  const isDashboardHome = pathname === "/dashboard"
  const showNav = isDashboard && !isDashboardHome

  const filteredNav = NAV_ITEMS.filter(
    (item) => !pathname.startsWith(item.link)
  )

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-white/60 dark:bg-neutral-900/60 shadow-md border-b border-white/20 dark:border-white/10"
          : "bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800"
      )}
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            KCET Admission Insights
          </h1>
          <p className="hidden text-xs text-neutral-600 dark:text-neutral-400 sm:block">
            Predict your college admission chances
          </p>
        </div>

        <div className="flex items-center gap-6">
          {showNav && (
            <nav className="hidden items-center gap-6 text-sm md:flex">
              {filteredNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="font-medium text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
