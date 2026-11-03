"use client"

import { useEffect } from "react"
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react"

interface KeyboardShortcutHandlers {
  undo: () => void
  redo: () => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

export function useKeyboardShortcuts<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  instance: ReactFlowInstance<NodeType, EdgeType>,
  { undo, redo }: KeyboardShortcutHandlers,
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return

      const isModifierPressed = event.metaKey || event.ctrlKey

      if (isModifierPressed && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }

      if (isModifierPressed && event.key.toLowerCase() === "y") {
        event.preventDefault()
        redo()
        return
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        void instance.zoomIn({ duration: 180 })
        return
      }

      if (event.key === "-") {
        event.preventDefault()
        void instance.zoomOut({ duration: 180 })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [instance, redo, undo])
}
