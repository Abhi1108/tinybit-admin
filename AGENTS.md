# TinyBit Admin — Agent Rules

Read `CLAUDE.md` for full project context. The rules below are non-negotiable for any agent session.

## No code patches

A **code patch** is a temporary workaround in application code instead of fixing the real problem —
for example fabricating metrics, inventing dummy API payloads, hashing IDs into fake percentages,
hardcoding placeholder names/dates as if they were live, or estimating values the backend does not
provide.

**Do not ship code patches.** Prefer:

- Real API fields from `src/services/adminApi.ts` / `tinybit-server`
- Honest empty states (`—`, `null`, empty lists) when data does not exist yet
- Building or wiring the proper endpoint/schema when the feature needs it

**Not a code patch (allowed):**

- Intentional `<Placeholder />` pages for modules not built yet
- Static UI awaiting API wiring (still replace with real data when you touch the page — don’t leave
  fabricated numbers)
- MySQL schema work in `tinybit-server`: `mysql/schema.sql` (CREATE for new DBs) and
  `mysql/patches/*.sql` (ALTER for existing DBs) — that is the correct ops workflow

## Related

See Working Principles and What NOT To Do in `CLAUDE.md`.
