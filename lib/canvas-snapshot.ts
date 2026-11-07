import type { CanvasEdge, CanvasNode } from "@/types/canvas"

export interface CanvasSnapshot {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPosition(value: unknown): value is { x: number; y: number } {
  if (!isRecord(value)) return false
  return typeof value.x === "number" && Number.isFinite(value.x) && typeof value.y === "number" && Number.isFinite(value.y)
}

function isNode(value: unknown): value is CanvasNode {
  if (!isRecord(value)) return false
  return typeof value.id === "string" && isPosition(value.position)
}

function isEdge(value: unknown): value is CanvasEdge {
  if (!isRecord(value)) return false
  return typeof value.id === "string" && typeof value.source === "string" && typeof value.target === "string"
}

export function parseCanvasSnapshot(value: unknown): CanvasSnapshot | null {
  if (!isRecord(value) || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) return null
  if (!value.nodes.every(isNode) || !value.edges.every(isEdge)) return null

  return { nodes: value.nodes, edges: value.edges }
}
