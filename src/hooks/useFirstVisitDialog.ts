import { useCallback, useEffect, useState } from "react"

import { ABOUT_DIALOG_STORAGE_KEY } from "@/lib/appMeta"

export function useFirstVisitDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(ABOUT_DIALOG_STORAGE_KEY)) {
        setOpen(true)
      }
    } catch {
      setOpen(true)
    }
  }, [])

  const suppressAutoOpen = useCallback(() => {
    try {
      localStorage.setItem(ABOUT_DIALOG_STORAGE_KEY, "1")
    } catch {
      // ignore storage failures
    }
  }, [])

  const onOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
  }, [])

  const openDialog = useCallback(() => {
    setOpen(true)
  }, [])

  return { open, onOpenChange, openDialog, suppressAutoOpen }
}
