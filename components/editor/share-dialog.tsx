"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Link2, UserPlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCollaborators, type Collaborator } from "@/hooks/use-collaborators"

interface ShareDialogProps {
  projectId: string
  isOwner: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShareDialogBodyProps {
  projectId: string
  isOwner: boolean
}

function CollaboratorAvatar({ collaborator }: { collaborator: Collaborator }) {
  const label = (collaborator.name ?? collaborator.email).charAt(0).toUpperCase()

  if (collaborator.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Clerk avatar URLs are remote and unconfigured for next/image.
      <img src={collaborator.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
    )
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-xs font-medium text-copy-secondary">
      {label}
    </span>
  )
}

function ShareDialogBody({ projectId, isOwner }: ShareDialogBodyProps) {
  const { collaborators, isLoading, isSubmitting, error, invite, remove } = useCollaborators(projectId)
  const [email, setEmail] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current)
    }
  }, [])

  async function handleInvite() {
    if (!email.trim()) return

    if (await invite(email)) setEmail("")
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(`${window.location.origin}/editor/${projectId}`)
    setIsCopied(true)

    if (copyTimeout.current) clearTimeout(copyTimeout.current)
    copyTimeout.current = setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Share project</DialogTitle>
        <DialogDescription>
          {isOwner ? "Invite collaborators by email to work on this project." : "People with access to this project."}
        </DialogDescription>
      </DialogHeader>

      {isOwner && (
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void handleInvite()
          }}
        >
          <Input
            type="email"
            aria-label="Collaborator email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" disabled={!email.trim() || isSubmitting}>
            <UserPlus />
            Invite
          </Button>
        </form>
      )}

      {error && <p className="text-sm text-state-error">{error}</p>}

      <div className="grid gap-2">
        <h3 className="text-sm font-medium text-copy-primary">Collaborators</h3>
        <ScrollArea className="max-h-60 rounded-2xl border border-surface-border bg-bg-surface">
          {isLoading ? (
            <p className="p-4 text-sm text-copy-muted">Loading collaborators…</p>
          ) : collaborators.length === 0 ? (
            <p className="p-4 text-sm text-copy-muted">No collaborators yet.</p>
          ) : (
            <ul className="divide-y divide-surface-border">
              {collaborators.map((collaborator) => (
                <li key={collaborator.id} className="flex items-center gap-3 px-4 py-3">
                  <CollaboratorAvatar collaborator={collaborator} />
                  <div className="min-w-0 flex-1">
                    {collaborator.name && (
                      <p className="truncate text-sm font-medium text-copy-primary">{collaborator.name}</p>
                    )}
                    <p className={collaborator.name ? "truncate text-xs text-copy-muted" : "truncate text-sm text-copy-primary"}>
                      {collaborator.email}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Remove ${collaborator.email}`}
                      disabled={isSubmitting}
                      onClick={() => void remove(collaborator.id)}
                    >
                      <X />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-4">
        <p className="flex items-center gap-2 text-sm text-copy-muted">
          <Link2 className="h-4 w-4" />
          Project link
        </p>
        <Button type="button" variant="secondary" onClick={() => void handleCopy()}>
          {isCopied ? <Check /> : <Copy />}
          {isCopied ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </>
  )
}

export function ShareDialog({ projectId, isOwner, open, onOpenChange }: ShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-surface-border bg-bg-elevated sm:max-w-md">
        <ShareDialogBody projectId={projectId} isOwner={isOwner} />
      </DialogContent>
    </Dialog>
  )
}
