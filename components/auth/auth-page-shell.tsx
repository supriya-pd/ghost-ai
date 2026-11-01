import type { ReactNode } from "react";

interface AuthPageShellProps {
  children: ReactNode;
  heading: string;
  description: string;
}

const features = [
  "Design systems in plain English",
  "Collaborate on a shared architecture canvas",
  "Turn the final graph into a technical spec",
];

export function AuthPageShell({
  children,
  heading,
  description,
}: AuthPageShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-8 lg:px-8">
      <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <section className="hidden lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand bg-accent-dim text-sm font-semibold text-brand">
              G
            </div>
            <span className="text-sm font-medium tracking-wide text-copy-primary">
              Ghost AI
            </span>
          </div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand">
            Collaborative system design
          </p>
          <h1 className="max-w-md text-4xl font-semibold tracking-tight text-copy-primary">
            Make architecture visible.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-copy-secondary">
            {description}
          </p>
          <ul className="mt-8 space-y-3 text-sm text-copy-muted">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-center">
          <div className="mb-6 text-center lg:hidden">
            <p className="text-lg font-semibold text-copy-primary">Ghost AI</p>
            <p className="mt-1 text-sm text-copy-muted">{heading}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
