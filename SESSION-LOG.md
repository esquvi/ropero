# Session Log

Index of Claude Code sessions on Ropero. Newest first. Each entry is its own file under `docs/sessions/`.

Claude should read the most recent session at the start of every new session for context (what's been shipped recently, open threads, user preferences picked up so far), then append a new dated file under `docs/sessions/` at the end of the session and add a line to this index. Doc-only, direct to main is fine per `CLAUDE.md`.

## 2026

- [2026-04-24 (afternoon): Repo hygiene sweep — uncommitted cleanup, stale branches, per-file triage](docs/sessions/2026-04-24-afternoon-hygiene.md)
- [2026-04-24: KNOWN-ISSUES sweep via parallel subagents + per-feature PRs](docs/sessions/2026-04-24-known-issues-sweep.md)
- [2026-04-18: mobile parity + device smoke test sprint + QA sweep](docs/sessions/2026-04-18-mobile-parity-qa.md)
- [2026-02-27: initial implementation (Phases 1-8)](docs/sessions/2026-02-27-implementation.md)

## Conventions for session entries

- File name: `YYYY-MM-DD-short-slug.md`. If two sessions land the same day, disambiguate with a time qualifier or a descriptive slug (e.g. `2026-04-24-afternoon-hygiene.md`).
- Start with an H1 matching the index line.
- Sections that tend to repeat: **Shipped**, **Decisions worth remembering**, **Known issues opened/closed**, **Next session starting points**, **Process notes and user preferences picked up**. Skip any that don't apply; add new ones freely.
- Cross-link KNOWN-ISSUES tags (e.g. `[HYGIENE-2026-04-24]`) so future-you can jump between the tracker and the session that created the entry.
