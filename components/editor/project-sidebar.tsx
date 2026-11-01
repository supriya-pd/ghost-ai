"use client"

import { Pencil, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Project } from "@/hooks/use-project-actions"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewProject: () => void
  myProjects: Project[]
  sharedProjects: Project[]
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
}

function ProjectList({ projects, onRename, onDelete }: { projects: Project[]; onRename?: (project: Project) => void; onDelete?: (project: Project) => void }) {
  if (projects.length > 0) {
    return (
      <div className="flex flex-col gap-1 p-3">
        {projects.map((project) => (
          <div key={project.id} className="group flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-bg-subtle">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-copy-primary">{project.name}</p>
              <p className="truncate font-mono text-[11px] text-copy-muted">/{project.slug}</p>
            </div>
            {project.isOwner && onRename && onDelete && (
              <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button aria-label={`Rename ${project.name}`} size="icon-xs" variant="ghost" onClick={() => onRename(project)}>
                  <Pencil />
                </Button>
                <Button aria-label={`Delete ${project.name}`} size="icon-xs" variant="ghost" onClick={() => onDelete(project)}>
                  <Trash2 />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

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
  myProjects,
  sharedProjects,
  onRename,
  onDelete,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && <button type="button" aria-label="Close project sidebar" className="fixed inset-0 top-14 z-30 bg-black/40 md:hidden" onClick={onClose} />}
      <aside
      aria-hidden={!isOpen}
      aria-label="Project navigation"
      inert={!isOpen}
      className={`fixed top-14 bottom-4 left-4 z-40 flex w-72 flex-col rounded-2xl border border-surface-border bg-bg-surface shadow-2xl transition-transform duration-200 ease-out ${
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

        <TabsContent value="my-projects" className="min-h-0 flex-1 overflow-y-auto">
          <ProjectList projects={myProjects} onRename={onRename} onDelete={onDelete} />
        </TabsContent>
        <TabsContent value="shared" className="min-h-0 flex-1 overflow-y-auto">
          <ProjectList projects={sharedProjects} />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button className="w-full" onClick={onNewProject}>
          <Plus />
          New Project
        </Button>
      </div>
      </aside>
    </>
  )
}
