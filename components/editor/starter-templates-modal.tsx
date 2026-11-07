"use client"

import { Download, LayoutTemplate } from "lucide-react"
import { useMemo } from "react"

import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = useMemo(() => ({
    width: Math.max(...template.nodes.map((node) => node.position.x + (node.width ?? 150))),
    height: Math.max(...template.nodes.map((node) => node.position.y + (node.height ?? 72))),
  }), [template])
  const scale = Math.min(284 / bounds.width, 138 / bounds.height)

  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-surface-border bg-bg-base" aria-label={`${template.name} diagram preview`}>
      <div className="absolute left-1/2 top-1/2" style={{ width: bounds.width, height: bounds.height, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${bounds.width} ${bounds.height}`}>
          {template.edges.map((edge) => {
            const source = template.nodes.find((node) => node.id === edge.source)
            const target = template.nodes.find((node) => node.id === edge.target)
            if (!source || !target) return null
            return <line key={edge.id} x1={source.position.x + (source.width ?? 150) / 2} x2={target.position.x + (target.width ?? 150) / 2} y1={source.position.y + (source.height ?? 72) / 2} y2={target.position.y + (target.height ?? 72) / 2} stroke="var(--text-muted)" strokeWidth="2" />
          })}
        </svg>
        {template.nodes.map((node) => (
          <div className="absolute flex items-center justify-center border border-surface-border px-2 text-center font-mono text-[10px]" key={node.id} style={{ backgroundColor: node.data.color, color: node.data.textColor, left: node.position.x, top: node.position.y, width: node.width ?? 150, height: node.height ?? 72, borderRadius: node.data.shape === "circle" || node.data.shape === "pill" ? "999px" : node.data.shape === "cylinder" ? "50% / 18%" : "10px", clipPath: node.data.shape === "diamond" ? "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" : node.data.shape === "hexagon" ? "polygon(18% 0, 82% 0, 100% 50%, 82% 100%, 18% 100%, 0 50%)" : undefined }}>{node.data.label}</div>
        ))}
      </div>
    </div>
  )
}

export function StarterTemplatesModal({ open, onOpenChange, onImport }: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)] max-w-4xl overflow-hidden rounded-3xl border-surface-border bg-bg-elevated p-6 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-copy-primary"><LayoutTemplate className="h-5 w-5 text-brand" />Starter templates</DialogTitle>
          <DialogDescription className="text-copy-muted">Choose a starting point for this architecture canvas. Importing replaces the current canvas.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[calc(100vh-13rem)] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
          {CANVAS_TEMPLATES.map((template) => (
            <article className="rounded-2xl border border-surface-border bg-bg-surface p-3" key={template.id}>
              <TemplatePreview template={template} />
              <div className="flex items-start gap-3 px-1 pb-1 pt-4">
                <div className="min-w-0 flex-1"><h3 className="font-medium text-copy-primary">{template.name}</h3><p className="mt-1 text-xs leading-5 text-copy-muted">{template.description}</p></div>
                <Button className="shrink-0" onClick={() => { onImport(template); onOpenChange(false) }} size="sm" type="button"><Download />Import</Button>
              </div>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
