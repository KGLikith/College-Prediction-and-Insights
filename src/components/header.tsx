import { ThemeToggle } from "./theme-toggle"

type Props = {}

export default function Header({}: Props) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">College Predictor</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Predict your college admission chances</p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
