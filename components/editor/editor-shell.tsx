"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { projectFromData, useProjectActions, type Project } from "@/hooks/use-project-actions"
import { Button } from "@/components/ui/button"

interface EditorShellProps { ownedProjects: Array<{ id: string; name: string; isOwner: boolean }>; sharedProjects: Array<{ id: string; name: string; isOwner: boolean }> }

export function EditorShell({ ownedProjects, sharedProjects }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const actions = useProjectActions()
  const myProjects: Project[] = ownedProjects.map(projectFromData)
  const collaboratorProjects: Project[] = sharedProjects.map(projectFromData)

  return (
    <div className="min-h-screen bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={actions.openCreate}
        myProjects={myProjects}
        sharedProjects={collaboratorProjects}
        onRename={actions.openRename}
        onDelete={actions.openDelete}
      />
      <main className="flex min-h-screen items-center justify-center px-6 pt-14">
        <div className="flex max-w-md flex-col items-center text-center">
          <h1 className="text-xl font-medium text-copy-primary">Create a project or open an existing one</h1>
          <p className="mt-2 text-sm text-copy-muted">Start a new architecture workspace, or choose a project from the sidebar.</p>
          <Button className="mt-6" onClick={actions.openCreate}>
            <Plus />
            New Project
          </Button>
        </div>
      </main>
      <ProjectDialogs
        activeDialog={actions.activeDialog}
        selectedProject={actions.selectedProject}
        projectName={actions.projectName}
        slugPreview={actions.slugPreview}
        isLoading={actions.isLoading}
        error={actions.error}
        onClose={actions.closeDialog}
        onNameChange={actions.setProjectName}
        onCreate={() => void actions.submitCreate()}
        onRename={() => void actions.submitRename()}
        onDelete={() => void actions.confirmDelete()}
      />
    </div>
  )
}
