"use client"

import { Minus, Plus, Redo2, Undo2, Maximize } from "lucide-react"

const controlButtonClassName =
  "flex h-8 w-8 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-bg-subtle hover:text-brand disabled:pointer-events-none disabled:opacity-35"

interface CanvasControlsProps {
  canUndo: boolean
  canRedo: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
}

export function CanvasControls({
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
}: CanvasControlsProps) {
  return (
    <div
      aria-label="Canvas controls"
      className="absolute bottom-24 left-5 z-10 flex items-center gap-1 rounded-full border border-surface-border bg-bg-surface/95 p-1.5 shadow-2xl backdrop-blur"
    >
      <div className="flex items-center gap-0.5" aria-label="Zoom controls">
        <button type="button" aria-label="Zoom out" title="Zoom out" onClick={onZoomOut} className={controlButtonClassName}>
          <Minus className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button type="button" aria-label="Fit view" title="Fit view" onClick={onFitView} className={controlButtonClassName}>
          <Maximize className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button type="button" aria-label="Zoom in" title="Zoom in" onClick={onZoomIn} className={controlButtonClassName}>
          <Plus className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
      <div className="mx-1 h-5 w-px bg-border-subtle" aria-hidden="true" />
      <div className="flex items-center gap-0.5" aria-label="History controls">
        <button type="button" aria-label="Undo" title="Undo" onClick={onUndo} disabled={!canUndo} className={controlButtonClassName}>
          <Undo2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button type="button" aria-label="Redo" title="Redo" onClick={onRedo} disabled={!canRedo} className={controlButtonClassName}>
          <Redo2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
