"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
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

        <div className="flex items-center justify-center" />

        <div className="flex items-center justify-end" />
      </div>
    </header>
  )
}
