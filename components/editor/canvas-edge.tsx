"use client"

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react"
import { Trash2 } from "lucide-react"
import { type ChangeEvent, type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react"

import type { CanvasEdge } from "@/types/canvas"

interface CanvasEdgeRendererProps extends EdgeProps<CanvasEdge> {
  onLabelChange?: (id: string, label: string) => void
  onDelete?: (id: string) => void
}

export function CanvasEdgeRenderer({
  data,
  id,
  markerEnd,
  onLabelChange,
  onDelete,
  selected,
  sourcePosition,
  sourceY,
  sourceX,
  targetPosition,
  targetX,
  targetY,
  style,
}: CanvasEdgeRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "")
  const inputRef = useRef<HTMLInputElement>(null)
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  function startEditing(event: MouseEvent<SVGPathElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDraftLabel(data?.label ?? "")
    setIsEditing(true)
  }

  function saveLabel() {
    onLabelChange?.(id, draftLabel.trim())
    setIsEditing(false)
  }

  function handleLabelChange(event: ChangeEvent<HTMLInputElement>) {
    setDraftLabel(event.target.value)
  }

  function handleLabelKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault()
      saveLabel()
    }
  }

  const hasLabel = Boolean(data?.label)
  const savedLabel = data?.label ?? ""
  const isActive = selected || isHovered || isEditing
  const edgeStyle = {
    ...style,
    fill: "none",
    stroke: "var(--text-primary)",
    strokeLinecap: "round" as const,
    strokeOpacity: isActive ? 1 : 0.9,
    strokeWidth: isActive ? 2.5 : 2,
  }

  return (
    <>
      <BaseEdge
        id={id}
        interactionWidth={24}
        markerEnd={markerEnd}
        onDoubleClick={startEditing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        path={edgePath}
        style={edgeStyle}
      />
      <EdgeLabelRenderer>
        {(isActive || hasLabel) && (
          <div
            className="nodrag nopan pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setDraftLabel(data?.label ?? "")
              setIsEditing(true)
            }}
            onPointerDown={(event) => event.stopPropagation()}
            style={{ left: labelX, top: labelY }}
          >
            <div className="flex items-center gap-1 rounded-xl border border-surface-border/80 bg-bg-elevated/95 p-1 shadow-sm">
              {isEditing ? (
                <input
                  ref={inputRef}
                  aria-label="Edge label"
                  className="nodrag nopan rounded-lg border border-brand bg-bg-base/80 px-2 py-1 text-center text-xs text-copy-primary outline-none"
                  onBlur={saveLabel}
                  onChange={handleLabelChange}
                  onKeyDown={handleLabelKeyDown}
                  style={{ width: `${Math.max(6, draftLabel.length + 2)}ch` }}
                  value={draftLabel}
                />
              ) : hasLabel ? (
                <span className="px-1 text-xs text-copy-secondary">{savedLabel}</span>
              ) : isActive ? (
                <span className="px-1 text-[10px] italic text-copy-faint">Double-click to label</span>
              ) : null}
              {selected && (
                <button
                  aria-label="Delete connector"
                  className="nodrag nopan flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-copy-muted transition-colors hover:bg-state-error/15 hover:text-state-error"
                  onClick={() => onDelete?.(id)}
                  onPointerDown={(event) => event.stopPropagation()}
                  title="Delete connector"
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              )}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
