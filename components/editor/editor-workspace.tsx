"use client"

import { useCallback, useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { AiSidebar } from "@/components/editor/ai-sidebar"
import { LiveblocksCanvas } from "@/components/editor/liveblocks-canvas"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"
import { projectFromData, useProjectActions } from "@/hooks/use-project-actions"
import { useProjectListRefresh } from "@/hooks/use-project-list"

interface EditorWorkspaceProps {
  project: { id: string; name: string; isOwner: boolean }
  ownedProjects: Array<{ id: string; name: string; isOwner: boolean }>
  sharedProjects: Array<{ id: string; name: string; isOwner: boolean }>
}

export function EditorWorkspace({ project, ownedProjects, sharedProjects }: EditorWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("idle")
  const [isCanvasLoading, setIsCanvasLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveCanvas, setSaveCanvas] = useState<(() => Promise<void>) | null>(null)
  const [templateToImport, setTemplateToImport] = useState<CanvasTemplate | null>(null)
  const handleTemplateImported = useCallback(() => setTemplateToImport(null), [])
  const handleSaveStatusChange = useCallback((status: CanvasSaveStatus, loading: boolean, dirty: boolean) => {
    setSaveStatus(status)
    setIsCanvasLoading(loading)
    setHasUnsavedChanges(dirty)
  }, [])
  const handleManualSaveChange = useCallback((save: (() => Promise<void>) | null) => {
    setSaveCanvas(() => save)
  }, [])
  const actions = useProjectActions()
  const { myProjects, sharedProjects: collaboratorProjects } = useProjectListRefresh(
    { myProjects: ownedProjects.map(projectFromData), sharedProjects: sharedProjects.map(projectFromData) },
    isSidebarOpen,
  )

  return (
    <div className="relative h-screen overflow-hidden bg-bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        projectName={project.name}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
        onShare={() => setIsShareOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        saveStatus={saveStatus}
        isCanvasLoading={isCanvasLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveCanvas ?? undefined}
        showUserButton={false}
      />
      <StarterTemplatesModal open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen} onImport={setTemplateToImport} />
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
          <LiveblocksCanvas roomId={project.id} templateToImport={templateToImport} onTemplateImported={handleTemplateImported} onSaveStatusChange={handleSaveStatusChange} onManualSaveChange={handleManualSaveChange} />
        </section>
        <AiSidebar isOpen={isAiSidebarOpen} onClose={() => setIsAiSidebarOpen(false)} />
      </main>
    </div>
  )
}
