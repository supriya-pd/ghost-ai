import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const instant = false;

export default function SignInPage() {
  return (
    <AuthPageShell
      heading="Sign in"
      description="A focused workspace for turning system ideas into clear, collaborative architecture."
    >
      <Suspense
        fallback={<p className="text-sm text-copy-muted">Loading sign in…</p>}
      >
        <SignIn
          appearance={clerkAppearance}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
        />
      </Suspense>
    </AuthPageShell>
  );
}
