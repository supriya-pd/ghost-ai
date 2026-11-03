"use client"

import { Bot, LayoutTemplate, PanelLeftClose, PanelLeftOpen, Share2 } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  isAiSidebarOpen?: boolean
  onToggleAiSidebar?: () => void
  onShare?: () => void
  onOpenTemplates?: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  onShare,
  onOpenTemplates,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

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

        <div className="truncate px-4 text-center text-sm font-medium text-copy-primary">{projectName}</div>

        <div className="flex items-center justify-end">
          {projectName && onOpenTemplates && <Button aria-label="Open starter templates" variant="ghost" onClick={onOpenTemplates}><LayoutTemplate />Templates</Button>}
          {projectName && onShare && <Button aria-label="Share project" variant="ghost" onClick={onShare}><Share2 />Share</Button>}
          {projectName && onToggleAiSidebar && <Button aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"} size="icon" variant={isAiSidebarOpen ? "secondary" : "ghost"} onClick={onToggleAiSidebar}><Bot /></Button>}
          <UserButton />
        </div>
      </div>
    </header>
  )
}
