"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { CanvasSnapshot } from "@/lib/canvas-snapshot"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error" | "unchanged"

interface UseCanvasAutosaveOptions {
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  onLoad: (snapshot: CanvasSnapshot) => void
}

interface UseCanvasAutosaveResult {
  saveStatus: CanvasSaveStatus
  isLoading: boolean
  hasUnsavedChanges: boolean
  save: () => Promise<void>
}

function serializeSnapshot(nodes: CanvasNode[], edges: CanvasEdge[]) {
  return JSON.stringify({ nodes, edges })
}

export function useCanvasAutosave({ projectId, nodes, edges, onLoad }: UseCanvasAutosaveOptions): UseCanvasAutosaveResult {
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("idle")
  const [isLoading, setIsLoading] = useState(true)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const statusTimeoutRef = useRef<number | null>(null)
  const hasCheckedSavedCanvasRef = useRef(false)
  const onLoadRef = useRef(onLoad)
  const savedSnapshotRef = useRef<string | null>(null)
  const hasUnsavedChanges = savedSnapshot !== null && savedSnapshot !== serializeSnapshot(nodes, edges)

  const setLastSavedSnapshot = useCallback((snapshot: string) => {
    savedSnapshotRef.current = snapshot
    setSavedSnapshot(snapshot)
  }, [])

  const showSaveResult = useCallback((status: "saved" | "error" | "unchanged") => {
    if (statusTimeoutRef.current !== null) window.clearTimeout(statusTimeoutRef.current)

    setSaveStatus(status)
    statusTimeoutRef.current = window.setTimeout(() => {
      setSaveStatus("idle")
      statusTimeoutRef.current = null
    }, 1500)
  }, [])

  const save = useCallback(async () => {
    const snapshot = { nodes: nodesRef.current, edges: edgesRef.current }
    const serializedSnapshot = serializeSnapshot(snapshot.nodes, snapshot.edges)
    if (savedSnapshotRef.current === serializedSnapshot) {
      showSaveResult("unchanged")
      return
    }

    if (statusTimeoutRef.current !== null) {
      window.clearTimeout(statusTimeoutRef.current)
      statusTimeoutRef.current = null
    }

    setSaveStatus("saving")
    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: serializedSnapshot,
      })
      if (!response.ok) throw new Error("Canvas save failed")
      setLastSavedSnapshot(serializedSnapshot)
      showSaveResult("saved")
    } catch {
      showSaveResult("error")
    }
  }, [projectId, setLastSavedSnapshot, showSaveResult])

  useEffect(() => {
    nodesRef.current = nodes
    edgesRef.current = edges
  }, [edges, nodes])

  useEffect(() => {
    onLoadRef.current = onLoad
  }, [onLoad])

  useEffect(() => {
    let cancelled = false

    async function loadSavedCanvas() {
      if (hasCheckedSavedCanvasRef.current) return

      if (nodes.length > 0 || edges.length > 0) {
        setLastSavedSnapshot(serializeSnapshot(nodes, edges))
        hasCheckedSavedCanvasRef.current = true
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, { cache: "no-store" })
        if (!response.ok) throw new Error("Canvas load failed")

        const body = (await response.json()) as { canvas?: CanvasSnapshot | null }
        if (!cancelled) {
          if (nodesRef.current.length === 0 && edgesRef.current.length === 0 && body.canvas) {
            setLastSavedSnapshot(serializeSnapshot(body.canvas.nodes, body.canvas.edges))
            onLoadRef.current(body.canvas)
          } else {
            setLastSavedSnapshot(serializeSnapshot(nodesRef.current, edgesRef.current))
          }
        }
      } catch {
        if (!cancelled) {
          setLastSavedSnapshot(serializeSnapshot(nodesRef.current, edgesRef.current))
          showSaveResult("error")
        }
      } finally {
        if (!cancelled) {
          hasCheckedSavedCanvasRef.current = true
          setIsLoading(false)
        }
      }
    }

    void loadSavedCanvas()
    return () => {
      cancelled = true
    }
  }, [edges, nodes, projectId, setLastSavedSnapshot, showSaveResult])

  useEffect(() => () => {
    if (statusTimeoutRef.current !== null) window.clearTimeout(statusTimeoutRef.current)
  }, [])

  return { saveStatus, isLoading, hasUnsavedChanges, save }
}
