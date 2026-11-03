"use client"

import { Component, type DragEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  type NodeProps,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense"
import { useLiveblocksFlow } from "@liveblocks/react-flow"

import { CanvasNodeRenderer } from "@/components/editor/canvas-node"
import { ShapePanel, type ShapeDragPayload } from "@/components/editor/shape-panel"
import { DEFAULT_NODE_COLOR, type CanvasEdge, type CanvasNode, type CanvasNodeShape } from "@/types/canvas"

interface LiveblocksCanvasProps {
  roomId: string
}

interface CanvasErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface CanvasErrorBoundaryState {
  hasError: boolean
}

class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  state: CanvasErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function CanvasLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-bg-base" role="status">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-copy-muted">Connecting canvas</p>
    </div>
  )
}

function CanvasError() {
  return (
    <div className="flex h-full items-center justify-center bg-bg-base px-6 text-center" role="alert">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-state-error">Canvas unavailable</p>
        <p className="mt-3 text-sm text-copy-muted">We could not connect to this collaborative canvas.</p>
      </div>
    </div>
  )
}

function isShapeDragPayload(value: unknown): value is ShapeDragPayload {
  if (!value || typeof value !== "object") return false

  const payload = value as Partial<ShapeDragPayload>
  const size = payload.size

  return (
    ["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"].includes(payload.shape as CanvasNodeShape) &&
    !!size &&
    Number.isFinite(size.width) &&
    Number.isFinite(size.height) &&
    size.width > 0 &&
    size.height > 0
  )
}

function numericDimension(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string") return undefined

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function CollaborativeFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: { initial: [] },
    edges: { initial: [] },
  })
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>()
  const [dragPreview, setDragPreview] = useState<{ payload: ShapeDragPayload; x: number; y: number } | null>(null)
  const nodesRef = useRef(nodes)
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    const legacyNodes = nodes.filter((node) => node.style?.width !== undefined || node.style?.height !== undefined)
    if (legacyNodes.length === 0) return

    onNodesChange(
      legacyNodes.map((node) => {
        const style = { ...node.style }
        const width = node.width ?? numericDimension(style.width)
        const height = node.height ?? numericDimension(style.height)
        delete style.width
        delete style.height

        return {
          type: "replace" as const,
          id: node.id,
          item: {
            ...node,
            ...(width === undefined ? {} : { width }),
            ...(height === undefined ? {} : { height }),
            style,
          },
        }
      }),
    )
  }, [nodes, onNodesChange])

  const updateNodeLabel = useCallback(
    (id: string, label: string) => {
      const node = nodesRef.current.find((currentNode) => currentNode.id === id)
      if (!node) return

      onNodesChange([
        {
          type: "replace",
          id,
          item: { ...node, data: { ...node.data, label } },
        },
      ])
    },
    [onNodesChange],
  )

  const clearLegacyNodeStyleDimensions = useCallback(
    (id: string) => {
      const node = nodesRef.current.find((currentNode) => currentNode.id === id)
      if (!node?.style || (node.style.width === undefined && node.style.height === undefined)) return

      const style = { ...node.style }
      delete style.width
      delete style.height

      onNodesChange([
        {
          type: "replace",
          id,
          item: { ...node, style },
        },
      ])
    },
    [onNodesChange],
  )

  const nodeTypes = useMemo(
    () => ({
      canvasNode: (props: NodeProps<CanvasNode>) => (
        <CanvasNodeRenderer
          {...props}
          onLabelChange={(label) => updateNodeLabel(props.id, label)}
          onResizeStart={() => clearLegacyNodeStyleDimensions(props.id)}
        />
      ),
    }),
    [clearLegacyNodeStyleDimensions, updateNodeLabel],
  )

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setDragPreview((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : current))
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    setDragPreview(null)

    const rawPayload =
      event.dataTransfer.getData("application/x-ghost-ai-shape") || event.dataTransfer.getData("text/plain")
    if (!rawPayload) return

    let payload: unknown
    try {
      payload = JSON.parse(rawPayload) as unknown
    } catch {
      return
    }
    if (!isShapeDragPayload(payload)) return

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const id = `${payload.shape}-${Date.now()}-${nodes.length + 1}`

    onNodesChange([
      {
        type: "add",
        item: {
          id,
          type: "canvasNode",
          position: {
            x: position.x - payload.size.width / 2,
            y: position.y - payload.size.height / 2,
          },
          width: payload.size.width,
          height: payload.size.height,
          data: { label: "", color: DEFAULT_NODE_COLOR, shape: payload.shape },
        },
      },
    ])
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-bg-base"
      onDragOverCapture={handleDragOver}
      onDropCapture={handleDrop}
    >
      <ReactFlow<CanvasNode, CanvasEdge>
        className="bg-bg-base"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-primary)" },
          style: { stroke: "var(--text-primary)", strokeWidth: 1.5 },
        }}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} color="var(--border-subtle)" gap={20} size={1} />
      </ReactFlow>
      {dragPreview && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-1/2 opacity-60"
          style={{ left: dragPreview.x, top: dragPreview.y, width: dragPreview.payload.size.width, height: dragPreview.payload.size.height }}
        >
          <CanvasNodeRenderer
            data={{ label: "", color: DEFAULT_NODE_COLOR, shape: dragPreview.payload.shape }}
            dragging={false}
            id="drag-preview"
            selected={false}
            type="canvasNode"
            positionAbsoluteX={0}
            positionAbsoluteY={0}
            zIndex={0}
            draggable={false}
            selectable={false}
            deletable={false}
            isConnectable={false}
          />
        </div>
      )}
      <ShapePanel
        onDragStart={(payload) => setDragPreview({ payload, x: 0, y: 0 })}
        onDragEnd={() => setDragPreview(null)}
      />
    </div>
  )
}

export function LiveblocksCanvas({ roomId }: LiveblocksCanvasProps) {
  return (
    <CanvasErrorBoundary key={roomId} fallback={<CanvasError />}>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <ReactFlowProvider>
              <CollaborativeFlow />
            </ReactFlowProvider>
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  )
}
