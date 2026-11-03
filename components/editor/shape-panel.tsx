"use client"

import type { DragEvent } from "react"
import { Circle, Cylinder, Diamond, Hexagon, Pill, Square } from "lucide-react"

import type { CanvasNodeShape } from "@/types/canvas"

export interface ShapeSize {
  width: number
  height: number
}

export interface ShapeDragPayload {
  shape: CanvasNodeShape
  size: ShapeSize
}

const SHAPES: Array<{ shape: CanvasNodeShape; label: string; size: ShapeSize; icon: typeof Square }> = [
  { shape: "rectangle", label: "Rectangle", size: { width: 180, height: 96 }, icon: Square },
  { shape: "diamond", label: "Diamond", size: { width: 150, height: 120 }, icon: Diamond },
  { shape: "circle", label: "Circle", size: { width: 120, height: 120 }, icon: Circle },
  { shape: "pill", label: "Pill", size: { width: 180, height: 72 }, icon: Pill },
  { shape: "cylinder", label: "Cylinder", size: { width: 150, height: 120 }, icon: Cylinder },
  { shape: "hexagon", label: "Hexagon", size: { width: 180, height: 108 }, icon: Hexagon },
]

function handleDragStart(event: DragEvent<HTMLButtonElement>, payload: ShapeDragPayload) {
  const serializedPayload = JSON.stringify(payload)
  event.dataTransfer.effectAllowed = "copy"
  event.dataTransfer.setData("application/x-ghost-ai-shape", serializedPayload)
  event.dataTransfer.setData("text/plain", serializedPayload)
}

export function ShapePanel() {
  return (
    <div
      aria-label="Add a shape"
      className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-bg-surface/95 p-2 shadow-2xl backdrop-blur"
    >
      {SHAPES.map(({ shape, label, size, icon: Icon }) => (
        <button
          key={shape}
          type="button"
          draggable
          aria-label={`Drag ${label.toLowerCase()} onto the canvas`}
          title={label}
          onDragStart={(event) => handleDragStart(event, { shape, size })}
          className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-bg-subtle hover:text-brand active:cursor-grabbing"
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}
