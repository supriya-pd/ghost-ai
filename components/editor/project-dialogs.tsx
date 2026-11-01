"use client"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Project } from "@/components/editor/use-project-dialogs"

interface ProjectDialogsProps {
  activeDialog: "create" | "rename" | "delete" | null
  selectedProject: Project | null
  projectName: string
  slugPreview: string
  isLoading: boolean
  onClose: () => void
  onNameChange: (name: string) => void
  onCreate: () => void
  onRename: () => void
  onDelete: () => void
}

export function ProjectDialogs({
  activeDialog,
  selectedProject,
  projectName,
  slugPreview,
  isLoading,
  onClose,
  onNameChange,
  onCreate,
  onRename,
  onDelete,
}: ProjectDialogsProps) {
  return (
    <>
      <Dialog open={activeDialog === "create"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="rounded-3xl border-surface-border bg-bg-elevated sm:max-w-md">
          <form onSubmit={(event) => { event.preventDefault(); onCreate() }}>
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>Start a new architecture workspace.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <label htmlFor="create-project-name" className="text-sm font-medium text-copy-primary">
                Project name
              </label>
              <Input
                id="create-project-name"
                autoFocus
                value={projectName}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="e.g. Payments platform"
              />
              <p className="text-xs text-copy-muted">
                Slug: <span className="font-mono text-copy-secondary">{slugPreview || "your-project-slug"}</span>
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={!projectName.trim() || isLoading}>Create project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "rename"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="rounded-3xl border-surface-border bg-bg-elevated sm:max-w-md">
          <form onSubmit={(event) => { event.preventDefault(); onRename() }}>
            <DialogHeader>
              <DialogTitle>Rename project</DialogTitle>
              <DialogDescription>Rename “{selectedProject?.name}”.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <label htmlFor="rename-project-name" className="text-sm font-medium text-copy-primary">
                Project name
              </label>
              <Input
                id="rename-project-name"
                autoFocus
                value={projectName}
                onChange={(event) => onNameChange(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={!projectName.trim() || isLoading}>Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "delete"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="rounded-3xl border-surface-border bg-bg-elevated sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This will remove “{selectedProject?.name}” from your projects.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={isLoading} onClick={onDelete}>
              <Trash2 />
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
