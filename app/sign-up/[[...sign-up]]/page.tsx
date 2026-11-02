import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const instant = false;

export default function SignUpPage() {
  return (
    <AuthPageShell
      heading="Create an account"
      description="Bring your team into a shared space for exploring, refining, and documenting architecture."
    >
      <Suspense
        fallback={<p className="text-sm text-copy-muted">Loading sign up…</p>}
      >
        <SignUp
          appearance={clerkAppearance}
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
        />
      </Suspense>
    </AuthPageShell>
  );
}
