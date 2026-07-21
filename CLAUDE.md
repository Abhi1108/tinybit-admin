# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

# TinyBit Admin — Project Guide

Single source of truth for any Claude Code session in **tinybit-admin**. There was no README or
CLAUDE.md here before this file — everything below was reconstructed from the code itself, so
re-verify anything version-sensitive (deps, routes) if it's been a while since this was written.

**Related repos**

| Repo | Role |
|------|------|
| `tinybit` (Expo SDK 56) | Mobile app — consumes `/api/*` on `tinybit-server` |
| **This repo** | Admin dashboard (Next.js) — consumes `/admin/api/*` on `tinybit-server` |
| `tinybit-server` | Node/Express + MySQL backend — see its own `CLAUDE.md` |

---

## Working Principles (read first)

1. **This admin panel has no design source of truth like Figma.** Tailwind + the `brand`/`teal`
   custom palette in `tailwind.config.js` and `src/components/ui.tsx` primitives are the de facto
   design system — reuse them rather than inventing new styles per page.
2. **Many pages are `Placeholder` stubs, not bugs.** Before "fixing" a page that looks empty or
   inert, check whether it renders `<Placeholder />` (see "Stub pages" below) — that's intentional
   scaffolding, not broken functionality.
3. **Don't assume a page's data is real.** Several real pages still read from `src/data/mockData.ts`
   alongside genuine API calls in the same file — verify per-page before trusting or extending logic
   that looks like it's live.
4. **No unrequested structural changes.** Don't move the `app/(protected)/*` domain folders or
   rename routes without confirming first — this codebase mirrors a specific nav/IA structure.
5. **Professional solutions only — no code patches.** A code patch is a temporary workaround in
   app code instead of doing it properly (fabricated metrics, dummy rows treated as live data,
   hashed/fake percentages, hardcoded placeholder names/dates, “estimates” for missing fields).
   If the real value isn’t available, show `—` / empty, or wire the real API — never invent data.
   (MySQL `schema.sql` + `mysql/patches/` on the server are **not** code patches; they are the
   correct DB ops workflow.) Confirm with the user if the correct fix is unclear.
6. **We do not do UI work here — this project is API-wiring only.** The UI for every module is
   already built (or intentionally stubbed as `Placeholder` until its own turn comes). The job on
   this repo is: take a "Static" module from the table below, replace its hardcoded in-file data
   with real calls through `src/services/adminApi.ts`, and preserve the existing markup/styling
   exactly as-is. Don't redesign, restyle, reflow, or rebuild a page's UI as part of an API-wiring
   task — if a page's UI genuinely needs to change to accommodate a real API shape, stop and confirm
   with the user first rather than deciding unilaterally.

---

## Project Overview

Admin dashboard for TinyBit / DD Medax (elderly health companion app). Lets ops/support staff
manage users, health content, catalog data (doctors, mood media, quizzes, inspirations), and view
analytics.

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript — **statically exported**, not SSR.
- **Backend:** `tinybit-server` (Node/Express + MySQL), consumed via `/admin/api/*`.
- **Deployment model:** This repo is built and its static output is copied *into* `tinybit-server`'s
  `public/admin/` folder, so the Express server serves the dashboard directly at `/admin`. It can
  also run standalone (`npm run dev`, port 3001) against a remote API for local iteration.

---

## Commands

```bash
npm run dev      # next dev -p 3001 — standalone local dev against NEXT_PUBLIC_API_BASE_URL
npm run build    # next build && node scripts/copy-build.js
npm start        # next start -p 3001 (standalone, post-build)
npm run lint     # next lint
```

`npm run build` behavior depends on `next.config.js` detecting a sibling server directory:
- If `../tinybit-server` (or `../server`) exists alongside this repo *and* has a `package.json`
  (or `ADMIN_INTEGRATED=1` is set), the build sets `output: 'export'` + `basePath: '/admin'`, and
  `scripts/copy-build.js` copies the static `out/` into `tinybit-server/public/admin`.
- Otherwise it builds a normal standalone Next.js app (no basePath).

This means **the sibling directory layout on disk changes what gets built** — if `tinybit-server`
isn't checked out next to this repo, you'll silently get a different (non-basePath'd) build. Worth
confirming which mode you're in before debugging a routing/asset issue.

---

## Tech Stack

```
next            ^14.2.5   (App Router, output: 'export')
react/react-dom ^18.3.1
typescript      ^5.5.3
tailwindcss     ^3.4.10   (custom `brand` blue + `teal` palettes, dark mode via class)
recharts        ^2.12.7   (dashboard/analytics charts)
lucide-react    ^0.441.0  (icons)
date-fns        ^3.6.0
clsx / tailwind-merge     (className utilities — see `cn()` in src/components/ui.tsx)
```

No React Query/SWR, no Redux/Zustand — data fetching is plain `fetch` wrapped in
`src/services/adminApi.ts`, state is local component `useState`/`useEffect`.

---

## Architecture

```
app/
├── auth/                        # Public: login, forgot-password, 2fa
│   ├── login/
│   ├── forgot-password/
│   └── 2fa/
└── (protected)/                 # Gated by ProtectedLayout (checks useAuth().isAuthenticated)
    ├── dashboard/                # Stats/analytics/charts landing page
    ├── users/                    # elders, guardians, family-circle, invitations, incomplete, roles
    ├── health/                   # medicines, checkins, conditions, vault, wellness
    ├── care/                     # doctors (real CRUD), calendar, appointments*, family-events*
    ├── emergency/                # sos, contacts*, incidents*
    ├── location/                 # live*, history*, geofencing*
    ├── journal/                  # text*, voice*, shared*
    ├── rewards/                  # leaderboard, streaks, achievements*, badges*
    ├── content/                  # breathing, mood-media, quizzes, inspirations (real catalog CRUD),
    │                             #   videos, faqs, tutorials*
    ├── ai/                       # analytics, costs, models, usage, conversations*, prompts*
    ├── subscriptions/            # plans, payments, revenue, user-subscriptions
    ├── notifications/            # push, email, scheduled, logs
    ├── support/                  # tickets, chat, queries, escalation
    ├── admin-management/         # accounts, roles, permissions, logs (see Auth caveat below)
    ├── settings/                 # general, ai, api-keys*, notifications, payment, roles, audit-logs
    └── reports/

src/
├── services/adminApi.ts         # THE api client — every backend call + response types live here
├── contexts/
│   ├── AuthContext.tsx          # admin session (login/logout/token), single shared identity
│   └── ThemeContext.tsx         # dark/light mode
├── components/
│   ├── ui.tsx                   # shared primitives: Badge, Avatar, StatCard, Card, Button, Input,
│   │                            #   Select, Modal, Table, Pagination, Tooltip, EmptyState, Tabs,
│   │                            #   ProgressBar, RoleBadge, HealthRiskBadge, StatusBadge, InfoRow,
│   │                            #   SeverityBadge, cn()
│   ├── charts.tsx                # recharts wrappers
│   ├── Placeholder.tsx           # "Coming Soon" stub used by unbuilt pages (see below)
│   ├── layout/                   # shell/nav components
│   └── users/                    # feature components, e.g. UserRowActions.tsx
├── data/mockData.ts              # mock data still imported by some real pages — see caveat above
├── hooks/, src/types/, src/utils/
```

*(`*` = page still renders `<Placeholder />`, not yet built — see "Module Status" below for the
full static/API-integrated/placeholder breakdown.)*

**Path conventions:** imports use `@/src/...` and `@/...` aliases (see `tsconfig.json` paths) —
follow existing per-file convention, this repo is not fully consistent about it.

---

## Auth Model

**Not the same auth as the mobile app.** Dynamic panel roles:

| Login | Role source | Notes |
|--------|-------------|--------|
| Env `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Implicit **Super Admin** | Full access (`permissions: ['*']`); manages admins + roles |
| `admin_users` row | Assigned `admin_roles` row | JWT carries `role`, `role_id`, `permissions[]` |

- Seeded system roles: `super_admin`, `operations_admin`, `content_manager`, `support_manager`,
  `moderator` (defaults match User Management → Role Management UI). Custom roles allowed.
- APIs: `GET/POST/PATCH/DELETE /admin/api/roles`, `GET/POST/PATCH/DELETE /admin/api/admins*`
  (admin CRUD + role mutations = Super Admin only). Other routes use `requirePermission(...)`.
- Client: `AuthContext` stores permissions; Sidebar hides nav via `src/utils/adminPermissions.ts`.
- Apply server patches: `mysql/patches/2026-07-20-admin-users.sql` then
  `mysql/patches/2026-07-20-admin-roles.sql` (or fresh `schema.sql`).
- 2FA UI exists but `verifyOtp()` still returns `false` — not implemented.
- Send `Authorization: Bearer <token>` on all `/admin/api/*` calls (handled by `adminApi.ts`).

---

## API Layer (`src/services/adminApi.ts`)

Single file, all backend calls. Base URL: `NEXT_PUBLIC_API_BASE_URL` (env) + `/admin/api`.

- `.env.local.example` points at the Vercel deployment
  (`https://tinybit-server.vercel.app`) — but check the actual `.env.local` in use, since it has
  pointed at a raw EC2 IP over plain HTTP before. Confirm which target is intended before assuming.
- Established, well-typed endpoints: users CRUD (`getAdminUsers`, `createAdminUser`,
  `updateAdminUser`, `banAdminUser`, `deleteAdminUser`), connections, stats/analytics, CSV export,
  broadcast messaging, S3 catalog presign upload.
- Newer catalog/domain endpoints (medicines, check-ins, moods, AI conversations, care events, mind
  games, doctors, mood-media, quiz questions, inspirations, health records) are typed
  `Promise<any>` — if you touch these, consider adding proper response types rather than
  perpetuating `any`.
- User deletion is a **trash pattern**, not a hard delete: `deleteAdminUser(id)` soft-deletes
  (sets `profiles.deleted_at`/`deleted_by`, recoverable), `restoreAdminUser(id)` undoes it, and
  `purgeAdminUser(id)` permanently erases an already-trashed user (S3 cleanup + cascading DB
  delete; server returns 409 if the user isn't trashed first). A server-side cron script
  (`tinybit-server/scripts/purge-deleted-users.js`) auto-purges after `USER_PURGE_GRACE_DAYS`
  (default 30). All three actions write to the server's `admin_audit_log` table. The trash view
  is `getAdminUsers({ deleted: 'only' })`, surfaced as an Active/Trash tab on the elders and
  guardians list pages.

---

## Module Status: Static vs. API-integrated vs. Placeholder

Every `page.tsx` under `app/(protected)/` was audited (grep for `Placeholder`, `adminApi`/`adminFetch`,
`mockData`, plus manual spot-checks) and falls into exactly one of three states. **Re-verify with a
grep before starting work** — this list is a snapshot, not a guarantee, and pages move between
categories as work lands.

### 1. API-integrated — already calls `adminApi.ts` for real data

These are done or partially done; check per-page whether *all* the data on the page is real, since a
few still mix in `mockData.ts` for parts of the view (noted below).

```
care/calendar             health/checkins            users/elders (+ [id] detail)
care/doctors               health/conditions           users/family-circle
content/breathing          health/medicines *          users/guardians (+ [id] detail)
content/inspirations        health/vault                users/incomplete
content/mood-media          health/wellness             users/invitations
content/quizzes             dashboard *
ai/usage *                  emergency/sos *
admin-management/logs       notifications/push *
```
`*` = mixes real `adminApi` calls with some `mockData.ts`-sourced or fabricated values (e.g.
`dashboard`, `emergency/sos`, `notifications/push`, `ai/usage` mix mock + real; `health/medicines`
fabricates its "adherence %" via a hash, not real log data). Treat these as **partially** wired.

`users/elders/[id]` and `users/guardians/[id]` both delegate to the shared
`src/components/users/UserProfileClient.tsx`, which does call `adminApi` — so the detail views are
real even though the route files themselves are 9-line wrappers.

### 2. Static — UI is fully built, but all data is hardcoded in-file (no backend call at all)

These are the modules most likely to be your next task: pull the existing hardcoded `const X = [...]`
data out and replace it with `adminApi.ts` calls, **without touching the JSX/markup**.

```
ai/analytics                 rewards/leaderboard         settings/roles
ai/costs                     rewards/streaks             subscriptions/payments
ai/models                    reports                     subscriptions/plans
content/faqs                 support/chat                subscriptions/revenue
content/videos                support/escalation          subscriptions/user-subscriptions
notifications (root)         support/queries              users/roles
notifications/email           support/tickets              admin-management/accounts
notifications/logs                                        admin-management/permissions
notifications/scheduled                                    admin-management/roles
settings/general
settings/ai
settings/notifications
settings/payment
settings/audit-logs
```

#### Wiring-effort tiers (checked against `tinybit-server/mysql/schema.sql` + `/admin/api/*` routes)

Not all Static modules cost the same to wire — some have real backing data today, some need one new
table following an existing pattern, some need a whole subsystem that doesn't exist yet. Re-verify
against the server before starting, this reflects the schema at the time it was written.

**Tier 1 — Easy (real table/endpoint already exists):**
- `rewards/leaderboard` — `profiles.streak`, `profiles.location`, `mind_games_scores.score` are real;
  `GET /admin/api/mind-games` already exists. (`tier`, `longestStreak`, `rank change` fields have no
  backing column — simplify/drop those, don't invent fake data to fill them.)
- `rewards/streaks` — `profiles.streak` + `profiles.last_active` cover current streak/last activity.
  (`status` active/paused/broken, `totalPoints`, `activities[]` aren't tracked anywhere.)
- `notifications` (root) / `notifications/logs` — the `notifications` table already exists and is
  already written by the working `broadcastNotification()` service (backs the already-wired
  `notifications/push` via `POST /admin/api/broadcast`). Just needs a `GET` endpoint to read it back.

**Tier 2 — Medium (one new table/endpoint, but copies an existing proven pattern):**
- `content/faqs` — shape (question/answer/category/status/order) is nearly identical to
  `daily_quiz_questions`/`daily_inspirations`, which already have full CRUD. Copy that pattern.
- `ai/analytics` — `ai_conversations` already logs every message with `user_id`/`provider`/
  `created_at`. No new table, just a new aggregation query (counts per day/provider).
- `settings/general` / `settings/ai` / `settings/notifications` — no table exists yet, but each only
  needs a small single-row config table, not a subsystem.

**Tier 3 — Hard (no backend subsystem exists at all — new feature work, not "wiring"):**
- `subscriptions/*` (plans, payments, revenue, user-subscriptions) — zero payment tables in schema.
  `profiles.plan_type/plan_status/plan_amount` exist but nothing populates them — this is the
  "Pro plan / payments — not started" item already flagged (P3) in `tinybit-server`'s own CLAUDE.md.
- `support/*` (tickets, chat, escalation, queries) — no ticketing tables at all.
- `admin-management/accounts` / `roles` / `permissions` + `users/roles` / `settings/roles` — **wired**
  to dynamic `admin_roles` (see Auth Model).
- `settings/audit-logs` — **now Tier 1**: `admin-management/logs` is fully wired to the real
  `admin_audit_log` table via `GET /admin/api/audit-log` (see `getAuditLogs` in `adminApi.ts`);
  this page just needs the same data source swapped in.
- `content/videos` — needs categories/tags/view-count tracking, not just a CRUD table.
- `ai/costs` / `ai/models` — need per-request token/cost instrumentation added into the AI
  controller; nothing per-model is tracked today.
- `notifications/scheduled` / `notifications/email` — need a real campaign-scheduling engine and
  email-sending integration; neither exists anywhere in `tinybit-server` (no SES/SendGrid, no job
  scheduler).
- `reports` — too generic/aggregate to size without more digging; likely depends on several of the
  above being wired first.

Suggested order: the three Tier 1 modules first (zero new schema), then `content/faqs` as a quick
Tier 2 win (copy-paste of an existing pattern).

### 3. Placeholder — not built yet, renders `<Placeholder />` only

Nothing to wire up here; these need actual page UI built first (out of scope for "API-wiring only"
work — flag to the user if asked to attach APIs to one of these, since there's no UI yet to attach to).

```
ai/conversations          journal/shared            rewards/badges
ai/prompts                journal/text              settings/api-keys
care/appointments         journal/voice
care/family-events        location/geofencing
content/tutorials         location/history
emergency/contacts        location/live
emergency/incidents       rewards/achievements
```

---

## Known Issues / Quality Concerns

- **Audit trail is live for admin actions** — `admin_audit_log` records login (incl. failed
  attempts), user create/update/ban/unban/trash/restore/purge, broadcast, and catalog CRUD, with
  actor + IP. `admin-management/logs` renders it via `GET /admin/api/audit-log` (CSV export at
  `/audit-log/export`). `settings/audit-logs` is still mock — swap it to the same source when
  its turn comes. Mobile-app user actions are NOT audited (by design — this is an admin log).
- **Auth/RBAC UI is ahead of the backend** — accounts/roles/permissions pages exist with no backing
  multi-admin system server-side.
- **2FA is non-functional** (`verifyOtp` hardcoded to `false`) despite UI implying it works.
- **Adherence on `health/medicines` is not computed yet** — UI shows `—` until a real
  medicine-log aggregation is wired (do not reintroduce hashed/fake percentages).
- **Some modules still use in-file static data or `mockData.ts`** until their backend exists
  (support, RBAC, etc.). When wiring a page, remove static/dummy values — never leave fabricated
  metrics alongside real API data.
- **Build artifacts committed to git**: `out/` (the exported static build) and a stray 2MB
  `Memory Journal.svg` are tracked in the repo despite `.gitignore` covering `.next`. Consider
  whether `out/` should actually be tracked before adding more generated output to git — confirm
  with the user before removing, since it may be intentional for the `tinybit-server` deploy step.
- **No tests** — no test runner/config found in the repo.

---

## What NOT To Do

- **Don't add code patches** — no fabricated metrics, dummy/static stand-ins for live fields, or
  temporary hacks. See `AGENTS.md`. Prefer real APIs or honest empties.
- Don't make UI/design changes as part of API-wiring work — swap hardcoded data for `adminApi.ts`
  calls and leave the JSX/styling untouched. Raise it with the user first if a real API response
  shape genuinely can't fit the existing UI.
- Don't assume a blank/inert page is broken — check for `<Placeholder />` first.
- Don't build on top of the roles/permissions/accounts UI as if it reflects real backend RBAC — it
  doesn't; flag this to the user if a task seems to assume otherwise.
- Don't add `Promise<any>` to new `adminApi.ts` functions — type new endpoints properly even though
  older ones aren't.
- Don't restructure `app/(protected)/*` domain folders without confirming — the nav/IA is
  intentional even where pages are still stubs.
- Don't delete `out/` or other committed build artifacts without confirming — may be load-bearing
  for the `tinybit-server` deploy step.
- Don't remove or skip `tinybit-server` MySQL patches (`mysql/patches/`) — those update existing
  DBs; keep them in sync with `mysql/schema.sql`.
