"use client"

import { Component, type DragEvent, type ReactNode } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
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

function CollaborativeFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: { initial: [] },
    edges: { initial: [] },
  })
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>()

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()

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
          style: payload.size,
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
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodeTypes={{ canvasNode: CanvasNodeRenderer }}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} color="var(--border-subtle)" gap={20} size={1} />
      </ReactFlow>
      <ShapePanel />
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
