"use client"

import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewProject?: () => void
}

function EmptyProjectState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 text-center">
      <p className="text-sm text-copy-muted">No projects yet.</p>
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      aria-label="Project navigation"
      className={`fixed inset-y-4 left-4 z-40 flex w-72 flex-col rounded-2xl border border-surface-border bg-bg-surface shadow-2xl transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-surface-border px-4">
        <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
        <Button aria-label="Close project sidebar" size="icon-sm" variant="ghost" onClick={onClose}>
          <X />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList className="mx-4 mt-4 w-auto bg-bg-subtle">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="my-projects" className="flex min-h-0 flex-1">
          <EmptyProjectState />
        </TabsContent>
        <TabsContent value="shared" className="flex min-h-0 flex-1">
          <EmptyProjectState />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button className="w-full" onClick={onNewProject}>
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  )
}
