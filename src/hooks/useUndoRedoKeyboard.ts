import { useEffect } from "react"

interface UseUndoRedoKeyboardOptions {
  enabled: boolean
  undo: () => void
  redo: () => void
}

export function useUndoRedoKeyboard({
  enabled,
  undo,
  redo,
}: UseUndoRedoKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA")
      ) {
        return
      }

      if (event.key === "z" || event.key === "Z") {
        event.preventDefault()
        undo()
        return
      }

      if (event.key === "y" || event.key === "Y") {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, undo, redo])
}
