"use client"

import { useState } from "react"

export interface Project {
  id: string
  name: string
  slug: string
  isOwner: boolean
}

export type ProjectDialog = "create" | "rename" | "delete" | null

interface UseProjectDialogsResult {
  activeDialog: ProjectDialog
  selectedProject: Project | null
  projectName: string
  slugPreview: string
  isLoading: boolean
  openCreate: () => void
  openRename: (project: Project) => void
  openDelete: (project: Project) => void
  closeDialog: () => void
  setProjectName: (name: string) => void
  submitCreate: () => Project | null
  submitRename: () => Project | null
  confirmDelete: () => string | null
}

function createSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function useProjectDialogs(): UseProjectDialogsResult {
  const [activeDialog, setActiveDialog] = useState<ProjectDialog>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const openCreate = () => {
    setSelectedProject(null)
    setProjectName("")
    setActiveDialog("create")
  }

  const openRename = (project: Project) => {
    setSelectedProject(project)
    setProjectName(project.name)
    setActiveDialog("rename")
  }

  const openDelete = (project: Project) => {
    setSelectedProject(project)
    setActiveDialog("delete")
  }

  const closeDialog = () => {
    setActiveDialog(null)
    setSelectedProject(null)
    setProjectName("")
  }

  const submitCreate = () => {
    const name = projectName.trim()
    if (!name) return null

    setIsLoading(true)
    const project = {
      id: `project-${Date.now()}`,
      name,
      slug: createSlug(name),
      isOwner: true,
    }
    setIsLoading(false)
    closeDialog()
    return project
  }

  const submitRename = () => {
    const name = projectName.trim()
    if (!name || !selectedProject) return null

    setIsLoading(true)
    const project = {
      ...selectedProject,
      name,
      slug: createSlug(name),
    }
    setIsLoading(false)
    closeDialog()
    return project
  }

  const confirmDelete = () => {
    if (!selectedProject) return null

    setIsLoading(true)
    const projectId = selectedProject.id
    setIsLoading(false)
    closeDialog()
    return projectId
  }

  return {
    activeDialog,
    selectedProject,
    projectName,
    slugPreview: createSlug(projectName),
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    setProjectName,
    submitCreate,
    submitRename,
    confirmDelete,
  }
}
