"use client"

import { Component, type DragEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useUser, UserButton } from "@clerk/nextjs"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  type Connection,
  type EdgeProps,
  type NodeProps,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense"
import { useCanRedo, useCanUndo, useMyPresence, useOthers, useRedo, useUndo } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"

import { CanvasControls } from "@/components/editor/canvas-controls"
import { CanvasNodeRenderer } from "@/components/editor/canvas-node"
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge"
import { ShapePanel, type ShapeDragPayload } from "@/components/editor/shape-panel"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { DEFAULT_NODE_COLOR, NODE_COLORS, type CanvasEdge, type CanvasNode, type CanvasNodeShape, type NodeColor } from "@/types/canvas"

interface LiveblocksCanvasProps {
  roomId: string
  templateToImport?: CanvasTemplate | null
  onTemplateImported?: () => void
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function PresenceOverlay() {
  const { user } = useUser()
  const others = useOthers()
  const collaborators = others.filter((other) => other.id !== user?.id)

  return (
    <div className="pointer-events-none absolute right-4 top-[4.5rem] z-30 flex items-center gap-3 rounded-2xl border border-surface-border bg-bg-surface/90 px-3 py-2 shadow-xl backdrop-blur">
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2" aria-label={`${collaborators.length} collaborator${collaborators.length === 1 ? "" : "s"} online`}>
          <div className="flex items-center pl-2">
            {collaborators.slice(0, 5).map((collaborator) => {
              const name = collaborator.info.name || collaborator.id

              return (
                <div
                  key={collaborator.connectionId}
                  className="relative -ml-2 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-bg-surface text-[10px] font-semibold text-copy-primary ring-1 ring-surface-border"
                  style={{ backgroundColor: collaborator.info.color }}
                  title={name}
                  aria-label={name}
                >
                  {collaborator.info.avatar ? (
                    <span
                      aria-hidden="true"
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${collaborator.info.avatar})` }}
                    />
                  ) : (
                    initials(name)
                  )}
                </div>
              )
            })}
            {collaborators.length > 5 && (
              <div
                className="relative -ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-bg-surface bg-bg-subtle text-[10px] font-semibold text-copy-primary ring-1 ring-surface-border"
                aria-label={`${collaborators.length - 5} more collaborators`}
              >
                +{collaborators.length - 5}
              </div>
            )}
          </div>
          <div className="h-6 w-px bg-surface-border" />
        </div>
      )}
      <div className="flex h-8 w-8 items-center justify-center" aria-label="Your profile">
        <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
      </div>
    </div>
  )
}

function LiveCursors() {
  const { user } = useUser()
  const others = useOthers()

  return (
    <>
      {others
        .filter((other) => other.id !== user?.id && other.presence.cursor !== null)
        .map((other) => {
          const cursor = other.presence.cursor
          if (!cursor) return null
          const name = other.info.name || other.id

          return (
            <div
              key={other.connectionId}
              className="pointer-events-none absolute z-20 flex items-start gap-1.5"
              style={{ left: cursor.x, top: cursor.y, color: other.info.color }}
            >
              <span className="mt-0.5 text-lg leading-none drop-shadow-md" aria-hidden="true">◆</span>
              <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-none text-bg-base shadow-md" style={{ backgroundColor: other.info.color }}>
                {name}
              </span>
            </div>
          )
        })}
    </>
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

function CollaborativeFlow({ templateToImport, onTemplateImported }: Pick<LiveblocksCanvasProps, "templateToImport" | "onTemplateImported">) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete: onFlowDelete } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: { initial: [] },
    edges: { initial: [] },
  })
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>()
  const { fitView, screenToFlowPosition } = reactFlow
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const [dragPreview, setDragPreview] = useState<{ payload: ShapeDragPayload; x: number; y: number } | null>(null)
  const [, updateMyPresence] = useMyPresence()
  useKeyboardShortcuts(reactFlow, {
    undo: () => {
      if (canUndo) undo()
    },
    redo: () => {
      if (canRedo) redo()
    },
  })
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const importedTemplateIdRef = useRef<string | null>(null)
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  useEffect(() => {
    const legacyEdges = edges.filter((edge) => edge.type !== "canvasEdge")
    if (legacyEdges.length === 0) return

    onEdgesChange(
      legacyEdges.map((edge) => ({
        type: "replace" as const,
        id: edge.id,
        item: {
          ...edge,
          type: "canvasEdge",
          data: { ...edge.data, label: edge.data?.label ?? "" },
        },
      })),
    )
  }, [edges, onEdgesChange])

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

  useEffect(() => {
    if (!templateToImport) {
      importedTemplateIdRef.current = null
      return
    }
    if (importedTemplateIdRef.current === templateToImport.id) return
    importedTemplateIdRef.current = templateToImport.id

    if (nodesRef.current.length > 0) onNodesChange(nodesRef.current.map((node) => ({ type: "remove" as const, id: node.id })))
    if (edgesRef.current.length > 0) onEdgesChange(edgesRef.current.map((edge) => ({ type: "remove" as const, id: edge.id })))
    onNodesChange(templateToImport.nodes.map((node) => ({ type: "add" as const, item: node })))
    onEdgesChange(templateToImport.edges.map((edge) => ({ type: "add" as const, item: edge })))
    requestAnimationFrame(() => void fitView({ duration: 220, padding: 0.2 }))
    onTemplateImported?.()
  }, [fitView, onEdgesChange, onNodesChange, onTemplateImported, templateToImport])

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

  const updateNodeColor = useCallback(
    (id: string, color: NodeColor) => {
      const node = nodesRef.current.find((currentNode) => currentNode.id === id)
      if (!node) return

      onNodesChange([
        {
          type: "replace",
          id,
          item: { ...node, data: { ...node.data, color: color.fill, textColor: color.text } },
        },
      ])
    },
    [onNodesChange],
  )

  const updateEdgeLabel = useCallback(
    (id: string, label: string) => {
      const edge = edgesRef.current.find((currentEdge) => currentEdge.id === id)
      if (!edge) return

      onEdgesChange([
        {
          type: "replace",
          id,
          item: { ...edge, data: { ...edge.data, label } },
        },
      ])
    },
    [onEdgesChange],
  )

  const deleteNode = useCallback(
    (id: string) => {
      const deletedNodes = nodesRef.current.filter((node) => node.id === id)
      const deletedEdges = edgesRef.current.filter((edge) => edge.source === id || edge.target === id)
      onFlowDelete({ nodes: deletedNodes, edges: deletedEdges })
    },
    [onFlowDelete],
  )

  const deleteEdge = useCallback(
    (id: string) => {
      onFlowDelete({ nodes: [], edges: edgesRef.current.filter((edge) => edge.id === id) })
    },
    [onFlowDelete],
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      onEdgesChange([
        {
          type: "add",
          item: {
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
            source: connection.source,
            sourceHandle: connection.sourceHandle,
            target: connection.target,
            targetHandle: connection.targetHandle,
            type: "canvasEdge",
            data: { label: "" },
          },
        },
      ])
    },
    [onEdgesChange],
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
          onColorChange={(color) => updateNodeColor(props.id, color)}
          onDelete={() => deleteNode(props.id)}
          onLabelChange={(label) => updateNodeLabel(props.id, label)}
          onResizeStart={() => clearLegacyNodeStyleDimensions(props.id)}
        />
      ),
    }),
    [clearLegacyNodeStyleDimensions, deleteNode, updateNodeColor, updateNodeLabel],
  )

  const edgeTypes = useMemo(
    () => ({
      canvasEdge: (props: EdgeProps<CanvasEdge>) => (
        <CanvasEdgeRenderer {...props} onDelete={deleteEdge} onLabelChange={updateEdgeLabel} />
      ),
    }),
    [deleteEdge, updateEdgeLabel],
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
          data: { label: "", color: DEFAULT_NODE_COLOR, textColor: NODE_COLORS[0].text, shape: payload.shape },
        },
      },
    ])
  }

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      updateMyPresence({ cursor: { x: event.clientX - bounds.left, y: event.clientY - bounds.top } })
    },
    [updateMyPresence],
  )

  const handleMouseLeave = useCallback(() => updateMyPresence({ cursor: null }), [updateMyPresence])

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
        onDelete={onFlowDelete}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: "canvasEdge",
          markerEnd: { type: MarkerType.ArrowClosed, color: "var(--text-primary)" },
          style: { stroke: "var(--text-primary)", strokeWidth: 1.5 },
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} color="var(--border-subtle)" gap={20} size={1} />
      </ReactFlow>
      <LiveCursors />
      <PresenceOverlay />
      <CanvasControls
        canUndo={canUndo}
        canRedo={canRedo}
        onZoomIn={() => void reactFlow.zoomIn({ duration: 180 })}
        onZoomOut={() => void reactFlow.zoomOut({ duration: 180 })}
        onFitView={() => void reactFlow.fitView({ duration: 220, padding: 0.2 })}
        onUndo={undo}
        onRedo={redo}
      />
      {dragPreview && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-1/2 opacity-60"
          style={{ left: dragPreview.x, top: dragPreview.y, width: dragPreview.payload.size.width, height: dragPreview.payload.size.height }}
        >
          <CanvasNodeRenderer
            data={{ label: "", color: DEFAULT_NODE_COLOR, textColor: NODE_COLORS[0].text, shape: dragPreview.payload.shape }}
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

export function LiveblocksCanvas({ roomId, templateToImport, onTemplateImported }: LiveblocksCanvasProps) {
  return (
    <CanvasErrorBoundary key={roomId} fallback={<CanvasError />}>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <ReactFlowProvider>
            <CollaborativeFlow templateToImport={templateToImport} onTemplateImported={onTemplateImported} />
            </ReactFlowProvider>
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  )
}
