# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- In Progress

## Current Goal

- Complete the presence avatars and live cursors feature, then verify the room view with a configured Liveblocks secret.

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
- Removed the create dialog's client-generated room ID preview because project creation persists a server-generated project ID, and kept successful creation on the existing `/editor` route.
- Updated the auth proxy to let `/api/*` handlers return their own JSON authentication responses while preserving protection for other non-public routes.
- Added server-side Clerk identity and owner/collaborator project access helpers in `lib/project-access.ts`.
- Added the `/editor/[roomId]` server route with sign-in redirects and `AccessDenied` handling for missing or unauthorized projects.
- Added the full-viewport editor workspace shell with project context, active project navigation, canvas placeholder, share control, and toggleable AI sidebar placeholder.
- Fixed new project creation to open the newly created project's `/editor/[roomId]` workspace using the ID returned by the create API.
- Routed editor authentication through the server pages so signed-out room links use the custom sign-in shell instead of Clerk middleware's standalone fallback.
- Made the sign-in and sign-up Clerk links explicitly target the app's custom `/sign-in` and `/sign-up` routes, keeping the branded auth shell during navigation.
- Added `lib/collaborators.ts` with email normalization and best-effort Clerk Backend API enrichment (display name and avatar) for collaborator emails, falling back to email only.
- Added `GET`/`POST /api/projects/[projectId]/collaborators` and `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]`; invite and remove enforce project ownership server-side (`401`, `403`, `404`, `409`).
- Added the `useCollaborators` hook and `ShareDialog` (owner invite/remove, read-only list for collaborators, `Copied!` link feedback) and enabled the navbar `Share` button.
- Defined Liveblocks presence and user metadata types for cursors, thinking state, display names, avatars, and cursor colors.
- Added the cached Liveblocks node client with deterministic cursor color assignment.
- Added `POST /api/liveblocks-auth` with Clerk authentication, project access checks, private-room creation, and per-session write authorization.
- Added shared canvas node and edge types in `types/canvas.ts`.
- Replaced the editor canvas placeholder with a Liveblocks-backed React Flow canvas using room providers, suspense loading, connection error fallback, loose connections, fit-to-view, minimap, and a dot background.
- Added the bottom shape panel with draggable shape payloads containing each shape's default size.
- Added drop-to-canvas node creation with React Flow coordinate conversion, generated IDs, default color, empty labels, and the selected shape value.
- Added the basic `canvasNode` renderer so newly dropped nodes are visible.
- Added shape-specific CSS and SVG node rendering with selected-state borders.
- Added a cursor-following ghost preview for shape drags, clearing it on drop or cancellation.
- Added selected-node resize handles with subtle dark-canvas styling and minimum dimensions.
- Added centered inline node label editing with empty-label placeholder text, live collaborative updates, blur/Escape completion, and canvas interaction guards.
- Added the custom canvas edge renderer with smooth-step routing, rounded arrowed strokes, hover/selection emphasis, and a wider invisible interaction path.
- Added collaborative inline edge label editing with midpoint positioning from `getSmoothStepPath`, growing inputs, saved pill labels, empty-edge hints, and canvas interaction guards.
- New connections now use the custom `canvasEdge` type, and legacy smooth-step edges migrate to that type when a room loads.
- Added three predefined starter templates with lightweight diagram previews, import actions, and a navbar entry point.
- Template import replaces the active collaborative canvas contents and fits the view after loading.
- Widened the starter-template dialog at desktop breakpoints and allowed card content to use the available width so template text remains readable.
- Added shape-aware automatic node-label sizing with padding, plus selected-node and selected-connector trash controls backed by collaborative remove changes. React Flow's selected delete action is wired to the same Liveblocks mutations.
- Corrected canvas delete controls to use `useLiveblocksFlow`'s dedicated `onDelete` mutation, including connected-edge cleanup for node deletion.
- Added room-only Liveblocks collaborator avatars with Clerk-backed current-user rendering, initials fallbacks, five-avatar stacking, and overflow counts.
- Added Liveblocks cursor presence updates from React Flow mouse movement, cursor cleanup on canvas leave, and colored name badges for other participants.
- Updated the shared Liveblocks presence contract from `isThinking` to the feature-defined `thinking` field.
- Replaced the editor AI sidebar placeholder with a separate floating `AiSidebar` component containing the AI Architect and Specs tabs, starter prompts, local chat UI, auto-resizing input, and demo spec card.
- Added sidebar-scoped project list refreshes so collaborator shared tabs remove projects after an owner deletes them, using the authenticated projects API immediately on open and every five seconds while open.

## In Progress

- Verify presence avatars, cursor broadcasting, node and edge editing, label sizing, deletion, and starter-template replacement with configured Liveblocks credentials.

## Next Up

- Run the full production build and verify the collaborative room behavior with a configured Liveblocks secret key, then begin the next planned feature unit.

## Open Questions

- The local `.env` currently exposes the database connection under the misspelled `DATABSE_URL` key; Prisma commands were run with that value mapped to the required `DATABASE_URL` name. Rename the local key before relying on automatic environment loading.
- Liveblocks room authorization requires `LIVEBLOCKS_SECRET_KEY` in the runtime environment for end-to-end verification.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Reviewed the custom toolbar reference and aligned its floating toolbar import and explanatory text with the Tiptap editor example.

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
- Updated the production build script to generate the Prisma client before compiling Next.js.
- Updated the Clerk card appearance override to use structured border and box-shadow styles.
- Workspace access is checked by project ID against the authenticated Clerk user ID or primary email collaborator record.
- Collaborator emails are stored trimmed and lowercased; no local user table is added, and Clerk lookup failures never block the collaborator list.
- Editor workspace lint and strict TypeScript validation pass. Production build validation is currently blocked before Next compilation by the existing Prisma 7 / Node 20 ESM-CJS incompatibility in `@prisma/dev`.
- Create-project navigation now validates the API response before routing, so a malformed success response surfaces an actionable error instead of navigating to the editor home.
- Editor routes remain protected by server-side identity checks, with room links preserving their destination in the sign-in redirect.
- Liveblocks rooms use project IDs as private room IDs; authorized project members receive explicit `*:write` access from the auth route.
- The base canvas owns only collaborative React Flow state and presentation; controls, custom node/edge rendering, persistence, and AI behavior remain out of scope for this unit.
- Base canvas lint and strict TypeScript validation pass; production build remains blocked before Next.js compilation by the existing Prisma 7 / Node 20 ESM-CJS incompatibility.
- The direct `next build` stage passes successfully after bypassing the blocked Prisma generation step.
- Node-shape TypeScript validation, lint, and direct `next build` pass; the full `npm run build` remains blocked by the existing Prisma 7 / Node 20 ESM-CJS incompatibility during `prisma generate`.
- Hid React Flow's built-in attribution label from the collaborative canvas surface.
- Node shapes use CSS for rectangle, pill, and circle variants, while diamond, hexagon, and cylinder use responsive inline SVG geometry.
- Shape previews reuse the existing node renderer and payload dimensions without changing dropped-node creation.
- Shape imports use the existing custom `canvasNode` type; shape-specific visuals remain intentionally deferred.
- Wrapped the collaborative canvas in `ReactFlowProvider` so shape-drop coordinate conversion has the required React Flow context at runtime.
- Preserved the latest dragover pointer position for reliable shape placement when the browser reports an invalid drop-event coordinate.
- Attached shape drag handlers directly to the React Flow surface so the canvas receives the browser drop event.
- Added capture-phase canvas drop handling so React Flow's internal pane handlers cannot prevent shape drops from reaching the Liveblocks node mutation.
- Reviewed the current canvas issues: the workspace flex layout was shrinking the canvas beside the AI panel, the canvas surface lacked an explicit edge-to-edge base background, and the project sidebar transition left too little off-screen clearance. The drag pipeline already had the required draggable source and capture handlers, but now uses React Flow's drop coordinates directly with a plain-text data-transfer fallback for browser compatibility.
- Made the editor canvas occupy the full viewport behind fixed overlay sidebars, removed layout participation from the AI sidebar, ensured the left sidebar has no closed-state pointer area or visible remnant, and kept the dotted React Flow background flush with the base surface.
- Fixed project sidebar delete (and rename/create dialog actions) in the workspace by mounting the shared `ProjectDialogs` component; the action hook was receiving clicks, but its dialog state had no rendered consumer on project routes.
- Node resizing uses React Flow's `NodeResizer`, whose dimension changes flow through the existing Liveblocks `onNodesChange` adapter and enforce an 80px by 48px minimum.
- Inline label changes use the existing Liveblocks flow `replace` change with the current node data, so each typed update is synchronized to collaborators without changing canvas storage boundaries.
- Fixed resize rendering for legacy nodes by removing conflicting `style.width` and `style.height` values on resize; new nodes now store dimensions in React Flow's top-level `width` and `height` fields.
- Confirmed `NodeResizer` exposes both corner handles and four edge resize lines, with the edge controls retaining the dark-canvas accent styling.
- Added a collaborative room-load migration for legacy nodes that still store dimensions under `style`, moving those dimensions to React Flow's top-level fields and removing the duplicate-rendering source.
- Prevented shape drops from being handled twice by using the outer canvas drop capture handler as the single insertion path and stopping propagation before React Flow can process the same event.
- Restored node dragging by limiting React Flow's `nodrag` and `nopan` guards to the inline label textarea instead of the entire node content surface.
- Added four hover-revealed Liveblocks/React Flow source handles per node and smooth-step arrow edges so collaborators can create connector lines between nodes.
- Added the selected-node color toolbar with all eight predefined fill/text pairs, immediate collaborative color updates, active swatch state, and controlled text-color hover glows.
- Node color selection keeps fill and paired text color together in collaborative node data; legacy nodes without a text color resolve their pairing from the existing fill palette.
- Edge labels are stored in the existing Liveblocks edge data flow; no new persistence boundary or server route was introduced.
- Added the floating canvas controls for animated zoom, fit view, and Liveblocks undo/redo with disabled history states.
- Added `useKeyboardShortcuts` for zoom, undo, and redo shortcuts while skipping inputs, textareas, selects, and contenteditable fields.
- Edge behavior lint and strict TypeScript validation pass. Full `npm run build` remains blocked before Next.js compilation by the existing Prisma 7 / Node 20 ESM-CJS incompatibility during `prisma generate`.
- Starter templates use static code-defined canvas snapshots, so no new persistence boundary or server route was introduced.
- Canvas ergonomics lint and strict TypeScript validation pass. Direct Next.js build verification is blocked in the managed sandbox when Turbopack tries to create a worker and bind to a port; the required `npx --no-install next internal agent-feedback-instructions` reporting command is likewise blocked because `npx` execution is not permitted.
- Presence avatars and cursor changes pass strict TypeScript validation and focused ESLint. Direct Next.js build verification reached compilation but remains blocked by unavailable Google Fonts network access; end-to-end Liveblocks verification also remains pending without a configured secret.
- The AI sidebar shell keeps the existing parent-controlled slide-in behavior and uses only existing design tokens; it is intentionally UI-only with no backend, Liveblocks, or AI generation logic.
- The project sidebar refreshes its list from the authenticated projects endpoint while open because server-rendered project props cannot receive mutations performed in another collaborator's browser; the existing endpoint now includes ownership metadata for client-side list partitioning.
- AI sidebar lint and strict TypeScript validation pass, and a direct `next build` completes successfully. The repository `npm run build` command remains blocked before Next.js compilation by the existing Prisma 7 / Node 20 ESM-CJS incompatibility during `prisma generate`.
