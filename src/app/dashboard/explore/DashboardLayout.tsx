import { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-neutral-50  dark:bg-neutral-950 overflow-y-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
    </div>
  )
}
