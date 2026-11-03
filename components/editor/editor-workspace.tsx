"use client"

import { useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { LiveblocksCanvas } from "@/components/editor/liveblocks-canvas"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { projectFromData, useProjectActions, type Project } from "@/hooks/use-project-actions"

interface EditorWorkspaceProps {
  project: { id: string; name: string; isOwner: boolean }
  ownedProjects: Array<{ id: string; name: string; isOwner: boolean }>
  sharedProjects: Array<{ id: string; name: string; isOwner: boolean }>
}

export function EditorWorkspace({ project, ownedProjects, sharedProjects }: EditorWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const actions = useProjectActions()
  const myProjects: Project[] = ownedProjects.map(projectFromData)
  const collaboratorProjects: Project[] = sharedProjects.map(projectFromData)

  return (
    <div className="relative h-screen overflow-hidden bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        projectName={project.name}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
        onShare={() => setIsShareOpen(true)}
      />
      <ShareDialog
        projectId={project.id}
        isOwner={project.isOwner}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
      />
      <ProjectDialogs
        activeDialog={actions.activeDialog}
        selectedProject={actions.selectedProject}
        projectName={actions.projectName}
        isLoading={actions.isLoading}
        error={actions.error}
        onClose={actions.closeDialog}
        onNameChange={actions.setProjectName}
        onCreate={() => void actions.submitCreate()}
        onRename={() => void actions.submitRename()}
        onDelete={() => void actions.confirmDelete()}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={actions.openCreate}
        myProjects={myProjects}
        sharedProjects={collaboratorProjects}
        activeProjectId={project.id}
        onRename={actions.openRename}
        onDelete={actions.openDelete}
      />
      <main className="absolute inset-0" aria-label="Architecture workspace">
        <section className="h-full w-full bg-bg-base" aria-label="Architecture canvas">
          <LiveblocksCanvas roomId={project.id} />
        </section>
        <aside
          aria-hidden={!isAiSidebarOpen}
          aria-label="AI sidebar placeholder"
          inert={!isAiSidebarOpen}
          className={`fixed right-4 top-[4.5rem] bottom-4 z-40 hidden w-80 rounded-2xl border border-surface-border bg-bg-surface/95 p-6 shadow-2xl backdrop-blur transition-transform duration-200 ease-out lg:block ${
            isAiSidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
          }`}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ai-text">AI assistant</p>
          <p className="mt-3 text-sm text-copy-muted">AI chat will be available here soon.</p>
        </aside>
      </main>
    </div>
  )
}
