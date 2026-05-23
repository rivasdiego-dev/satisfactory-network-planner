export const GITHUB_REPO_URL =
  "https://github.com/rivasdiego-dev/satisfactory-network-planner"

export const ABOUT_DIALOG_STORAGE_KEY = "snp-about-dialog-seen"

export const APP_TAGLINE =
  "Plan your conveyor and pipeline networks before you build."

export type OnboardingStep = {
  id: string
  label: string
  title: string
  body: string
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    label: "Welcome",
    title: "Ficsit Network Planner",
    body: APP_TAGLINE,
  },
  {
    id: "upload",
    label: "Step 1",
    title: "Upload your map",
    body: "Drop a screenshot of your Satisfactory map — PNG, JPG, or WebP. \n\n Hint: Paste from clipboard works too.",
  },
  {
    id: "place",
    label: "Step 2",
    title: "Place your points",
    body: "Click on the map to add nodes (where power must reach) and waypoints (optional routing hints). \n\n Hint: Right-click to remove a point.",
  },
  {
    id: "compute",
    label: "Step 3",
    title: "Auto-route the network",
    body: "The planner computes an optimal network between your nodes. \n\n Hint: Use the ruler to snap lines to angles.",
  },
  {
    id: "finish",
    label: "Ready",
    title: "Export & build",
    body: "Export your plan as PNG or copy it to the clipboard. Open source and free forever — star the repo if it helps.",
  },
]
