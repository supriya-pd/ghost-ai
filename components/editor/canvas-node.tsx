"use client"

import type { NodeProps } from "@xyflow/react"

import type { CanvasNode } from "@/types/canvas"

export function CanvasNodeRenderer({ data }: NodeProps<CanvasNode>) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-xl border-2 border-copy-muted bg-bg-elevated px-4 text-center text-sm text-copy-primary"
      style={{ backgroundColor: data.color }}
    >
      {data.label}
    </div>
  )
}
