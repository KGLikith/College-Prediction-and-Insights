"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

const NAV_ITEMS = [
  { label: "Predictions", href: "/dashboard/predictions" },
  { label: "Last Year Results", href: "/dashboard/results" },
  { label: "Explore Colleges", href: "/dashboard/explore/colleges" },
  { label: "KCET Assistant", href: "/dashboard/chat" },
  { label: "Preference Order", href: "/dashboard/preference" },
]

export default function Header() {
  const pathname = usePathname()

  const isDashboard = pathname.startsWith("/dashboard")
  const isDashboardHome = pathname === "/dashboard"

  // Show nav ONLY inside dashboard sub-pages
  const showNav = isDashboard && !isDashboardHome

  const filteredNav = NAV_ITEMS.filter(
    (item) => !pathname.startsWith(item.href)
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight">
            KCET Admission Insights
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Predict your college admission chances
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex items-center gap-6">
          {showNav && (
            <nav className="hidden md:flex items-center gap-4 text-sm">
              {filteredNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition"
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
