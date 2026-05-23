import { InfoIcon } from "lucide-react"

interface AppHeaderProps {
  statusText: string
  onAboutClick: () => void
}

export function AppHeader({ statusText, onAboutClick }: AppHeaderProps) {
  return (
    <header className="flex shrink-0 gap-3 bg-accent p-4">
      <p className="text-3xl tracking-tight text-primary uppercase">
        Ficsit Network Planner
      </p>
      <div className="flex items-center gap-2 border-l px-4">
        <button
          type="button"
          onClick={onAboutClick}
          className="rounded-sm text-blue-200 transition-opacity hover:opacity-80"
          aria-label="About this app"
        >
          <InfoIcon size={16} />
        </button>
        <p>{statusText}</p>
      </div>
    </header>
  )
}
