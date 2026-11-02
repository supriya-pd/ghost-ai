"use client"

import { useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { projectFromData, useProjectActions, type Project } from "@/hooks/use-project-actions"

interface EditorWorkspaceProps {
  project: { id: string; name: string; isOwner: boolean }
  ownedProjects: Array<{ id: string; name: string; isOwner: boolean }>
  sharedProjects: Array<{ id: string; name: string; isOwner: boolean }>
}

export function EditorWorkspace({ project, ownedProjects, sharedProjects }: EditorWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
  const actions = useProjectActions()
  const myProjects: Project[] = ownedProjects.map(projectFromData)
  const collaboratorProjects: Project[] = sharedProjects.map(projectFromData)

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        projectName={project.name}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
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
      <main className="flex min-h-0 flex-1 pt-14">
        <section className="flex min-w-0 flex-1 items-center justify-center bg-bg-base px-6" aria-label="Canvas placeholder">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-copy-faint">Canvas</p>
            <p className="mt-3 text-sm text-copy-muted">Your architecture canvas will appear here.</p>
          </div>
        </section>
        {isAiSidebarOpen && (
          <aside className="hidden w-80 shrink-0 border-l border-surface-border bg-bg-surface p-6 lg:block" aria-label="AI sidebar placeholder">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ai-text">AI assistant</p>
            <p className="mt-3 text-sm text-copy-muted">AI chat will be available here soon.</p>
          </aside>
        )}
      </main>
    </div>
  )
}
