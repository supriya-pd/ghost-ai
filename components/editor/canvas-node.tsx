"use client"

import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"
import { Trash2 } from "lucide-react"
import { type ChangeEvent, type CSSProperties, type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react"

import { NODE_COLORS, type CanvasNode, type NodeColor } from "@/types/canvas"

interface CanvasNodeRendererProps extends NodeProps<CanvasNode> {
  onLabelChange?: (label: string) => void
  onColorChange?: (color: NodeColor) => void
  onDelete?: () => void
  onResizeStart?: () => void
}

const MIN_NODE_WIDTH = 80
const MIN_NODE_HEIGHT = 48

function getTextMetrics(shape: CanvasNode["data"]["shape"], width = 160, height = 96, value: string) {
  const shapeScale = {
    circle: 0.58,
    diamond: 0.54,
    hexagon: 0.68,
    cylinder: 0.78,
    pill: 0.82,
    rectangle: 1,
  }[shape]
  const availableWidth = Math.max(24, Math.min(width * shapeScale, width - 24))
  const availableHeight = Math.max(20, Math.min(height * shapeScale, height - 16))

  for (let fontSize = 18; fontSize >= 7; fontSize -= 1) {
    const charactersPerLine = Math.max(1, Math.floor(availableWidth / (fontSize * 0.58)))
    const lineCount = Math.max(1, Math.ceil(Math.max(1, value.length) / charactersPerLine))
    if (lineCount * fontSize * 1.2 <= availableHeight) {
      return { fontSize, maxWidth: availableWidth }
    }
  }

  return { fontSize: 7, maxWidth: availableWidth }
}

export function CanvasNodeRenderer({ data, height, onColorChange, onDelete, onLabelChange, onResizeStart, selected, width }: CanvasNodeRendererProps) {
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
  const activeColor =
    NODE_COLORS.find((color) => color.fill === data.color && color.text === data.textColor) ??
    NODE_COLORS.find((color) => color.fill === data.color) ??
    NODE_COLORS[0]
  const textMetrics = getTextMetrics(data.shape, width, height, isEditing ? draftLabel : label)

  const colorToolbar = selected ? (
    <div
      aria-label="Node colors"
      className="nodrag nopan absolute left-1/2 top-0 z-30 flex -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] items-center gap-1 rounded-xl border border-surface-border bg-bg-elevated/95 p-1 shadow-lg backdrop-blur-sm"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      role="toolbar"
    >
      {NODE_COLORS.map((color, index) => {
        const isActive = color.fill === activeColor.fill && color.text === activeColor.text
        const swatchStyle = { "--swatch-text": color.text } as CSSProperties

        return (
          <button
            aria-label={`Set node color ${index + 1}`}
            className={`nodrag nopan h-5 w-5 rounded-full border transition-[box-shadow,transform] hover:scale-110 hover:shadow-[0_0_8px_var(--swatch-text)] ${
              isActive ? "border-brand ring-2 ring-brand/50" : "border-surface-border"
            }`}
            key={color.fill}
            onClick={() => onColorChange?.(color)}
            onPointerDown={(event) => event.stopPropagation()}
            style={{ ...swatchStyle, backgroundColor: color.fill }}
            title={`Color ${index + 1}`}
            type="button"
          />
        )
      })}
      <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-border-subtle" />
      <button
        aria-label="Delete node"
        className="nodrag nopan flex h-6 w-6 items-center justify-center rounded-lg text-copy-muted transition-colors hover:bg-state-error/15 hover:text-state-error"
        onClick={onDelete}
        onPointerDown={(event) => event.stopPropagation()}
        title="Delete node"
        type="button"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
      </button>
    </div>
  ) : null

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
      className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden px-4 text-center"
      onDoubleClick={startEditing}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          aria-label="Node label"
          className="nodrag nopan max-h-full min-h-6 w-full resize-none overflow-hidden rounded-lg border border-brand bg-bg-base/80 px-2 py-1 text-center outline-none"
          onBlur={finishEditing}
          onChange={handleLabelChange}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onKeyDown={handleLabelKeyDown}
          onPointerDown={(event) => event.stopPropagation()}
          style={{ fontSize: `${textMetrics.fontSize}px`, lineHeight: 1.2 }}
          value={draftLabel}
        />
      ) : (
        <span
          className={`max-w-full break-words px-2 ${data.label ? "" : "text-copy-muted italic"}`}
          style={{ fontSize: `${textMetrics.fontSize}px`, lineHeight: 1.2, maxWidth: textMetrics.maxWidth }}
        >
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
      <div className="group relative h-full w-full" style={{ color: data.textColor ?? activeColor.text }}>
        {colorToolbar}
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
      className={`group relative flex h-full w-full items-center justify-center border ${shapeClassName} ${selected ? "border-brand" : "border-surface-border"}`}
      style={{ backgroundColor: data.color, color: data.textColor ?? activeColor.text }}
    >
      {colorToolbar}
      {connectionHandles}
      {resizeControls}
      {content}
    </div>
  )
}
