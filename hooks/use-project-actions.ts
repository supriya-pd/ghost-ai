"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export interface Project { id: string; name: string; slug: string; isOwner: boolean }
export type ProjectDialog = "create" | "rename" | "delete" | null

interface UseProjectActionsResult {
  activeDialog: ProjectDialog
  selectedProject: Project | null
  projectName: string
  isLoading: boolean
  error: string | null
  openCreate: () => void
  openRename: (project: Project) => void
  openDelete: (project: Project) => void
  closeDialog: () => void
  setProjectName: (name: string) => void
  submitCreate: () => Promise<void>
  submitRename: () => Promise<void>
  confirmDelete: () => Promise<void>
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "")
}

async function getError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  return body?.error ?? "Something went wrong. Please try again."
}

async function getCreatedProjectId(response: Response) {
  const body = (await response.json().catch(() => null)) as { project?: { id?: unknown } } | null
  const projectId = body?.project?.id

  if (typeof projectId !== "string" || projectId.length === 0) {
    throw new Error("Project was created, but its workspace could not be opened.")
  }

  return projectId
}

export function projectFromData(project: { id: string; name: string; isOwner: boolean }): Project {
  return { ...project, slug: slugify(project.name) || "untitled-project" }
}

export function useProjectActions(): UseProjectActionsResult {
  const router = useRouter()
  const [activeDialog, setActiveDialog] = useState<ProjectDialog>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeDialog = () => { setActiveDialog(null); setSelectedProject(null); setProjectName(""); setError(null) }
  const openCreate = () => { setSelectedProject(null); setProjectName(""); setError(null); setActiveDialog("create") }
  const openRename = (project: Project) => { setSelectedProject(project); setProjectName(project.name); setError(null); setActiveDialog("rename") }
  const openDelete = (project: Project) => { setSelectedProject(project); setError(null); setActiveDialog("delete") }

  const submitCreate = async () => {
    const name = projectName.trim(); if (!name || isLoading) return
    setIsLoading(true); setError(null)
    try {
      const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
      if (!response.ok) throw new Error(await getError(response))
      const projectId = await getCreatedProjectId(response)
      closeDialog(); router.push(`/editor/${projectId}`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create project.") }
    finally { setIsLoading(false) }
  }

  const submitRename = async () => {
    const name = projectName.trim(); if (!name || !selectedProject || isLoading) return
    setIsLoading(true); setError(null)
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
      if (!response.ok) throw new Error(await getError(response))
      closeDialog(); router.refresh()
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to rename project.") }
    finally { setIsLoading(false) }
  }

  const confirmDelete = async () => {
    if (!selectedProject || isLoading) return
    setIsLoading(true); setError(null)
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error(await getError(response))
      closeDialog(); router.push("/editor"); router.refresh()
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete project.") }
    finally { setIsLoading(false) }
  }

  return { activeDialog, selectedProject, projectName, isLoading, error, openCreate, openRename, openDelete, closeDialog, setProjectName, submitCreate, submitRename, confirmDelete }
}
