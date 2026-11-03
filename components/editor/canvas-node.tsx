"use client"

import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"
import { type ChangeEvent, type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react"

import type { CanvasNode } from "@/types/canvas"

interface CanvasNodeRendererProps extends NodeProps<CanvasNode> {
  onLabelChange?: (label: string) => void
  onResizeStart?: () => void
}

const MIN_NODE_WIDTH = 80
const MIN_NODE_HEIGHT = 48

export function CanvasNodeRenderer({ data, onLabelChange, onResizeStart, selected }: CanvasNodeRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data.label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus()
  }, [isEditing])

  function startEditing(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDraftLabel(data.label)
    setIsEditing(true)
  }

  function handleLabelChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const label = event.target.value
    setDraftLabel(label)
    onLabelChange?.(label)
  }

  function finishEditing() {
    setIsEditing(false)
  }

  function handleLabelKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      finishEditing()
    }
  }

  const label = data.label || "Double-click to label"
  const shapeClassName =
    data.shape === "pill"
      ? "rounded-full"
      : data.shape === "circle"
        ? "rounded-full"
        : "rounded-xl"

  const isSvgShape = data.shape === "diamond" || data.shape === "hexagon" || data.shape === "cylinder"

  const connectionHandles = (
    <>
      {[Position.Top, Position.Right, Position.Bottom, Position.Left].map((position) => (
        <Handle
          className="z-20 h-2 w-2 border border-surface-border bg-bg-elevated opacity-0 transition-opacity group-hover:opacity-100"
          id={`source-${position}`}
          key={position}
          position={position}
          type="source"
        />
      ))}
    </>
  )

  const content = (
    <div
      className="relative z-10 flex h-full w-full items-center justify-center px-4 text-center"
      onDoubleClick={startEditing}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          aria-label="Node label"
          className="nodrag nopan max-h-full min-h-6 w-full resize-none overflow-hidden rounded-lg border border-brand bg-bg-base/80 px-2 py-1 text-center text-sm text-copy-primary outline-none"
          onBlur={finishEditing}
          onChange={handleLabelChange}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onKeyDown={handleLabelKeyDown}
          onPointerDown={(event) => event.stopPropagation()}
          value={draftLabel}
        />
      ) : (
        <span className={`px-2 text-sm ${data.label ? "text-copy-primary" : "text-copy-muted italic"}`}>
          {label}
        </span>
      )}
    </div>
  )

  const resizeControls = (
    <NodeResizer
      handleClassName="h-2 w-2 rounded-sm border border-surface-border bg-bg-elevated"
      isVisible={selected}
      lineClassName="border-brand/60"
      minHeight={MIN_NODE_HEIGHT}
      minWidth={MIN_NODE_WIDTH}
      onResizeStart={onResizeStart}
    />
  )

  if (isSvgShape) {
    return (
      <div className="group relative h-full w-full text-copy-primary">
        {connectionHandles}
        {resizeControls}
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {data.shape === "diamond" && <polygon points="50,1 99,50 50,99 1,50" />}
          {data.shape === "hexagon" && <polygon points="18,1 82,1 99,50 82,99 18,99 1,50" />}
          {data.shape === "cylinder" && (
            <>
              <path d="M1 15 C1 7 99 7 99 15 V85 C99 93 1 93 1 85 Z" />
              <ellipse cx="50" cy="15" rx="49" ry="14" />
            </>
          )}
          <style>{
            `
              polygon, path, ellipse {
                fill: ${data.color};
                stroke: ${selected ? "var(--accent-primary)" : "var(--border-subtle)"};
                stroke-width: ${selected ? 2 : 1};
                vector-effect: non-scaling-stroke;
              }
            `
          }</style>
        </svg>
        <div className="relative flex h-full w-full items-center justify-center">{content}</div>
      </div>
    )
  }

  return (
    <div
      className={`group flex h-full w-full items-center justify-center border ${shapeClassName} ${selected ? "border-brand" : "border-surface-border"}`}
      style={{ backgroundColor: data.color }}
    >
      {connectionHandles}
      {resizeControls}
      {content}
    </div>
  )
}
