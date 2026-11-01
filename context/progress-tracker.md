# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Complete

## Current Goal

- Wire the editor home to the real project API defined in `context/feature-specs/07-wire-editor-home.md`.

## Completed

- Configured shadcn/ui with Radix UI and Lucide icons.
- Added Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea primitives.
- Added the reusable `cn()` helper in `lib/utils.ts`.
- Applied the dark Ghost AI design tokens in `app/globals.css`.
- Added the reusable editor navbar with sidebar toggle state and left, center, and right sections.
- Added the floating project sidebar with slide-in behavior, project tabs, empty states, and New Project action.
- Confirmed the existing dialog primitives support token-based title, description, and footer action patterns.
- Installed `@clerk/ui` and wrapped the root application in ClerkProvider using the existing dark design tokens.
- Added responsive Clerk sign-in and sign-up pages with token-based appearance overrides.
- Configured the root `proxy.ts` to keep the root and Clerk auth paths public while protecting all other matched routes.
- Updated `/` to redirect authenticated users to `/editor` and unauthenticated users to `/sign-in`.
- Added Clerk's built-in UserButton to the editor navbar and a minimal editor shell for the authenticated destination.
- Added the editor home empty state with a `New Project` action and mock project data.
- Added the dedicated project dialog hook for create, rename, and delete form/dialog state.
- Added create, rename, and destructive delete dialogs with live slug preview and Enter-to-submit rename behavior.
- Wired owner-only sidebar actions, shared-project action hiding, and the mobile sidebar backdrop scrim.
- Added the `ProjectStatus`, `Project`, and `ProjectCollaborator` Prisma models with the required relations, indexes, uniqueness constraint, and cascade behavior.
- Added the cached `lib/prisma.ts` singleton with Prisma Accelerate and direct PostgreSQL adapter branches.
- Configured Prisma to load the split schema directory and generated the Prisma client under `app/generated/prisma`.
- Created and applied the initial PostgreSQL migration at `prisma/migrations/20261101141401_init`.
- Added authenticated project list and create route handlers at `/api/projects`.
- Added owner-only project rename and delete route handlers at `/api/projects/[projectId]`.
- Added `401` responses for unauthenticated requests, `403` responses for non-owner mutations, and validation for project names.
- Added the server-side editor project loader for owned and collaborator projects.
- Replaced mock editor projects with server-loaded project data.
- Added `useProjectActions` for API-backed create, rename, and delete mutations with navigation and refresh behavior.
- Added room ID preview generation and surfaced mutation errors in the project dialogs.
- Extended `GET /api/projects` to include projects shared with the authenticated user's primary email.

## In Progress

- None.

## Next Up

- Begin the next planned feature unit after verifying the wired editor home implementation.

## Open Questions

- The local `.env` currently exposes the database connection under the misspelled `DATABSE_URL` key; Prisma commands were run with that value mapped to the required `DATABASE_URL` name. Rename the local key before relying on automatic environment loading.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Design-system primitives pass lint and production build validation.
- Corrected the home page to import the local shadcn Button instead of Radix's toolbar item; lint and production build pass.
- Editor chrome components were added with token-based styling and callback-driven interactions.
- Tightened the project sidebar contract and accessibility behavior: New Project requires an action, closed state is inert, and the panel begins below the navbar.
- Authentication implementation passes `npm run lint` and `npm run build`.
- Next.js 16 request-time auth checks use `instant = false`, and Clerk forms render behind Suspense boundaries as required by Cache Components.
- Project dialogs and editor home pass `npm run lint` and strict TypeScript validation; the feature intentionally uses mock state with no API or persistence.
- Prisma schema validation, client generation, and the initial migration pass with Prisma 7.10.1 using the installed Node 26 runtime.
- Project API handlers use Clerk's authenticated user ID as `ownerId`, Prisma's generated `cuid()` IDs, and JSON responses with conventional `201`, `204`, `400`, `401`, `403`, and `404` statuses.
- Project API handlers pass `npm run lint` and `npm run build`.
- Editor home wiring passes lint and build validation; workspace route behavior remains reserved for the canvas feature unit.
- The editor route uses Next.js 16's `instant = false` directive because its server-side project loader depends on authenticated runtime data.
- Hardened editor project loading against transient Clerk `currentUser()` aborts so the `/editor` route does not enter a retry/compile-looking failure loop.
