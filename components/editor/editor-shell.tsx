"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { useProjectDialogs, type Project } from "@/components/editor/use-project-dialogs"
import { Button } from "@/components/ui/button"

const initialProjects: Project[] = [
  { id: "project-platform", name: "Platform architecture", slug: "platform-architecture", isOwner: true },
  { id: "project-search", name: "Search redesign", slug: "search-redesign", isOwner: true },
]

const sharedProjects: Project[] = [
  { id: "project-collaboration", name: "Collaboration service", slug: "collaboration-service", isOwner: false },
]

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState(initialProjects)
  const dialogs = useProjectDialogs()

  const handleCreate = () => {
    const project = dialogs.submitCreate()
    if (project) setProjects((currentProjects) => [project, ...currentProjects])
  }

  const handleRename = () => {
    const project = dialogs.submitRename()
    if (project) {
      setProjects((currentProjects) =>
        currentProjects.map((currentProject) => currentProject.id === project.id ? project : currentProject)
      )
    }
  }

  const handleDelete = () => {
    const projectId = dialogs.confirmDelete()
    if (projectId) setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId))
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={dialogs.openCreate}
        myProjects={projects}
        sharedProjects={sharedProjects}
        onRename={dialogs.openRename}
        onDelete={dialogs.openDelete}
      />
      <main className="flex min-h-screen items-center justify-center px-6 pt-14">
        <div className="flex max-w-md flex-col items-center text-center">
          <h1 className="text-xl font-medium text-copy-primary">Create a project or open an existing one</h1>
          <p className="mt-2 text-sm text-copy-muted">Start a new architecture workspace, or choose a project from the sidebar.</p>
          <Button className="mt-6" onClick={dialogs.openCreate}>
            <Plus />
            New Project
          </Button>
        </div>
      </main>
      <ProjectDialogs
        activeDialog={dialogs.activeDialog}
        selectedProject={dialogs.selectedProject}
        projectName={dialogs.projectName}
        slugPreview={dialogs.slugPreview}
        isLoading={dialogs.isLoading}
        onClose={dialogs.closeDialog}
        onNameChange={dialogs.setProjectName}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </div>
  )
}
