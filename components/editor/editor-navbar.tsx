"use client"

import { Bot, Check, CircleAlert, LayoutTemplate, LoaderCircle, PanelLeftClose, PanelLeftOpen, Save, Share2 } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  isAiSidebarOpen?: boolean
  onToggleAiSidebar?: () => void
  onShare?: () => void
  onOpenTemplates?: () => void
  saveStatus?: CanvasSaveStatus
  isCanvasLoading?: boolean
  hasUnsavedChanges?: boolean
  onSave?: () => Promise<void>
  showUserButton?: boolean
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  onShare,
  onOpenTemplates,
  saveStatus,
  isCanvasLoading = false,
  hasUnsavedChanges = false,
  onSave,
  showUserButton = true,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen
  const saveFeedback = saveStatus ?? "idle"

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-surface-border bg-bg-surface">
      <div className="grid h-full grid-cols-3 items-center px-4">
        <div className="flex items-center">
          <Button
            aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
            size="icon"
            variant="ghost"
            onClick={onToggleSidebar}
          >
            <SidebarIcon />
          </Button>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-3 px-4">
          <div className="truncate text-sm font-medium text-copy-primary">{projectName}</div>
        </div>

        <div className="flex items-center justify-end">
          {projectName && (
            <Button
              className="shrink-0"
              aria-label={saveFeedback === "saving" ? "Saving canvas" : saveFeedback === "saved" ? "Canvas saved" : saveFeedback === "error" ? "Canvas save error" : saveFeedback === "unchanged" || !hasUnsavedChanges ? "Project already saved" : "Save canvas"}
              title={!hasUnsavedChanges && !isCanvasLoading ? "Project already saved" : undefined}
              disabled={isCanvasLoading || !onSave || !hasUnsavedChanges || saveFeedback === "saving"}
              variant="ghost"
              onClick={() => void onSave?.()}
            >
              {saveFeedback === "saving" ? <LoaderCircle className="animate-spin" /> : saveFeedback === "saved" ? <Check className="text-state-success" /> : saveFeedback === "error" ? <CircleAlert className="text-state-error" /> : <Save />}
              <span aria-live="polite">{saveFeedback === "saving" ? "Saving..." : saveFeedback === "saved" ? "Saved" : saveFeedback === "error" ? "Error" : saveFeedback === "unchanged" ? "Project already saved" : "Save"}</span>
            </Button>
          )}
          {projectName && onOpenTemplates && <Button aria-label="Open starter templates" variant="ghost" onClick={onOpenTemplates}><LayoutTemplate />Templates</Button>}
          {projectName && onShare && <Button aria-label="Share project" variant="ghost" onClick={onShare}><Share2 />Share</Button>}
          {projectName && onToggleAiSidebar && <Button aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"} size="icon" variant={isAiSidebarOpen ? "secondary" : "ghost"} onClick={onToggleAiSidebar}><Bot /></Button>}
          {showUserButton && <UserButton />}
        </div>
      </div>
    </header>
  )
}
