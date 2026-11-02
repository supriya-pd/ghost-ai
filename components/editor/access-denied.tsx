import { LockKeyhole } from "lucide-react"
import Link from "next/link"

export function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-bg-surface text-copy-muted">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-medium text-copy-primary">Access denied</h1>
        <p className="mt-2 text-sm text-copy-muted">You do not have access to this project, or it no longer exists.</p>
        <Link className="mt-6 text-sm text-brand underline-offset-4 hover:underline" href="/editor">Back to projects</Link>
      </div>
    </main>
  )
}
