"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, FileText, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
}

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 72), 160)}px`
  }, [draft])

  const submitMessage = () => {
    const content = draft.trim()
    if (!content) return

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", content },
    ])
    setDraft("")
  }

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submitMessage()
    }
  }

  return (
    <aside
      aria-hidden={!isOpen}
      aria-label="AI workspace"
      inert={!isOpen}
      className={`fixed right-4 top-[4.5rem] bottom-4 z-40 hidden w-80 rounded-2xl border border-surface-border bg-bg-base/95 shadow-2xl backdrop-blur transition-transform duration-200 ease-out lg:flex lg:flex-col ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
      }`}
    >
      <header className="flex items-start justify-between border-b border-surface-border px-4 py-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-lg bg-accent-dim p-1.5 text-ai-text" aria-hidden="true">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-copy-primary">AI Workspace</h2>
            <p className="mt-0.5 text-xs text-copy-muted">Collaborate with Ghost AI</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close AI sidebar" onClick={onClose}>
          <X />
        </Button>
      </header>

      <Tabs defaultValue="architect" className="min-h-0 flex-1 gap-0">
        <TabsList className="m-3 grid w-auto grid-cols-2 bg-bg-subtle">
          <TabsTrigger value="architect" className="data-active:bg-brand data-active:text-bg-base text-copy-muted">
            AI Architect
          </TabsTrigger>
          <TabsTrigger value="specs" className="data-active:bg-brand data-active:text-bg-base text-copy-muted">
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architect" className="mt-0 flex min-h-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1 px-4">
            {messages.length === 0 ? (
              <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
                <div className="rounded-2xl bg-accent-dim p-3 text-ai-text" aria-hidden="true">
                  <Bot className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-copy-primary">Start designing with Ghost AI</h3>
                <p className="mt-2 max-w-[15rem] text-xs leading-5 text-copy-muted">
                  Describe the system you want to build and I&apos;ll help map out its architecture.
                </p>
                <div className="mt-5 flex flex-col items-center gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="rounded-full bg-bg-subtle px-3 py-1.5 text-left text-xs text-ai-text transition-colors hover:bg-bg-elevated"
                      onClick={() => setDraft(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "ml-auto border-2 border-brand/50 bg-accent-dim text-copy-primary"
                        : "mr-auto border border-surface-border bg-bg-elevated text-ai-text"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-surface-border p-3">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleDraftKeyDown}
                placeholder="Describe your architecture..."
                aria-label="Message Ghost AI"
                className="max-h-40 min-h-[72px] resize-none pr-10 text-sm"
                rows={3}
              />
              <Button
                type="button"
                size="icon-sm"
                aria-label="Send message"
                disabled={!draft.trim()}
                onClick={submitMessage}
                className="absolute right-2 bottom-2 bg-brand text-bg-base hover:bg-brand/80"
              >
                <Send />
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-copy-faint">Enter to send · Shift+Enter for a new line</p>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="mt-0 flex min-h-0 flex-1 flex-col gap-4 px-4">
          <Button type="button" className="w-full bg-brand text-bg-base hover:bg-brand/80">
            Generate Spec
          </Button>
          <article className="rounded-xl border border-surface-border bg-bg-elevated p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-accent-dim p-2 text-ai-text" aria-hidden="true">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-copy-primary">Architecture spec</h3>
                <p className="mt-2 text-xs leading-5 text-copy-muted">
                  Your generated technical specification will appear here after the canvas is ready.
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" disabled className="mt-4 w-full">
              Download spec
            </Button>
          </article>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
