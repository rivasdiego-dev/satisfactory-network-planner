import { AnimatePresence, motion } from "motion/react"
import {
  ArrowRight,
  ChevronLeft,
  Code2,
  Cpu,
  FileUp,
  MapPin,
  Star,
  Wrench,
  X,
} from "lucide-react"
import { useState } from "react"

import BorderGlow from "@/components/BorderGlow"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import { Button } from "@/components/ui/button"
import { GITHUB_REPO_URL, ONBOARDING_STEPS } from "@/lib/appMeta"
import { cn } from "@/lib/utils"

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppressAutoOpen: () => void
}

const STEP_ICONS = [null, FileUp, MapPin, Cpu, Star] as const

function HexLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-10", className)}
      aria-hidden
    >
      <path
        d="M24 2L44 13.5V38.5L24 50L4 38.5V13.5L24 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CornerAccent({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute size-6 border-primary", className)}
    />
  )
}

function StepIcon({ index }: { index: number }) {
  const Icon = STEP_ICONS[index]
  if (!Icon) return <HexLogo className="text-primary" />
  return (
    <div className="flex size-12 items-center justify-center border border-primary/30 bg-primary/5 text-primary">
      <Icon className="size-5" />
    </div>
  )
}

export function AboutDialog({
  open,
  onOpenChange,
  suppressAutoOpen,
}: AboutDialogProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const step = ONBOARDING_STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1
  const isWelcome = step.id === "welcome"

  useEffect(() => {
    if (!open) {
      setStepIndex(0)
      setDontShowAgain(false)
    }
  }, [open])

  const finish = () => {
    if (dontShowAgain) suppressAutoOpen()
    onOpenChange(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isLast && dontShowAgain) suppressAutoOpen()
    onOpenChange(nextOpen)
  }

  const goNext = () => {
    if (isLast) {
      finish()
      return
    }
    setStepIndex((i) => Math.min(ONBOARDING_STEPS.length - 1, i + 1))
  }

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        from="top"
        className="border-0 bg-transparent p-0 shadow-none sm:max-w-sm"
      >
        <BorderGlow
          animated={open}
          borderRadius={16}
          backgroundColor="#120F17"
          colors={["#A855F7", "#7C3AED", "#FA9549"]}
          className="w-full"
        >
          <div className="relative flex min-h-[420px] flex-col gap-6 p-8">
            <CornerAccent className="top-4 left-4 border-t-2 border-l-2" />
            <CornerAccent className="right-4 bottom-4 border-r-2 border-b-2" />

            {isLast && (
              <button
                type="button"
                onClick={finish}
                className="absolute top-4 right-4 z-10 rounded-sm text-muted-foreground transition-opacity hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-1 flex-col justify-center"
              >
                <div className="flex flex-col items-center text-center">
                  {!isWelcome && (
                    <p className="mb-3 text-xs tracking-[0.2em] text-primary uppercase">
                      {step.label}
                    </p>
                  )}

                  <StepIcon index={stepIndex} />

                  <DialogTitle className="font-heading mt-4 text-xl leading-tight font-semibold tracking-wider text-primary uppercase">
                    {isWelcome ? (
                      <>
                        Satisfactory Network
                        <br />
                        Planner
                      </>
                    ) : (
                      step.title
                    )}
                  </DialogTitle>

                  <DialogDescription className="mt-3 max-w-[280px] whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </DialogDescription>
                </div>

                {isWelcome && (
                  <div className="mt-6 flex gap-3">
                    <div className="flex flex-1 items-center justify-center gap-1.5 border border-primary/30 bg-primary/5 px-3 py-2 text-xs tracking-widest text-primary uppercase">
                      <Star className="size-3.5 shrink-0" />
                      Open Source
                    </div>
                    <div className="flex flex-1 items-center justify-center gap-1.5 border border-primary/30 bg-primary/5 px-3 py-2 text-xs tracking-widest text-primary uppercase">
                      <Wrench className="size-3.5 shrink-0" />
                      Free Forever
                    </div>
                  </div>
                )}

                {isWelcome && (
                  <div className="mt-3 text-xs text-muted-foreground text-justify">
                    <span className="font-bold block">
                      Disclaimer
                    </span>
                    This tool is not affiliated with or endorsed by {' '}
                    <a className="underline" href="https://www.coffeestain.com/" target="_blank" rel="noopener noreferrer">Coffee Stain Studios</a>.
                    If you are a fan of the game, please support the developers by buying the game. <br /> Visit the official website at {' '}
                    <a className="underline" href="https://satisfactorygame.com" target="_blank" rel="noopener noreferrer">satisfactorygame.com</a>.
                  </div>
                )}

                {isLast && (
                  <div className="mt-6 flex flex-col gap-3">
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={GITHUB_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Code2 data-icon="inline-start" />
                        Star on GitHub
                      </a>
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col gap-4">
              {isLast && (
                <label className="flex cursor-pointer items-center justify-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="size-3.5 rounded-sm border-border accent-primary"
                  />
                  Don&apos;t show this again
                </label>
              )}

              <div className="flex w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={goBack}
                  disabled={isFirst}
                >
                  <ChevronLeft data-icon="inline-start" />
                  Back
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  onClick={goNext}
                >
                  {isLast ? "Start Planning" : "Next"}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2">
                {ONBOARDING_STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Go to ${s.label}`}
                    onClick={() => setStepIndex(i)}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      i === stepIndex
                        ? "bg-primary"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </BorderGlow>
      </DialogContent>
    </Dialog>
  )
}
