# Phase 2 Notes — Djasha System

**Status:** v1 shipped 2026-04-22. Phase 2 not yet scoped in detail.

This file captures deferred decisions, known gaps, and the path to Phase 2 so future sessions don't re-litigate the v1 design.

---

## Recap of v1 architecture

- **Static Astro 6 site** deployed to Vercel (primary) + Coolify-ready (Dockerfile + Caddyfile in repo).
- **Content lives in git** — `src/content/{components,patterns,tokens,voice}/*.{doc.mdx,yaml}`.
- **8 components migrated** from the portfolio, each with a live playground, 4 copy tabs (Preview / Code / Prompt / Bundle), and meta rail.
- **CI forcing function**: every `src/components/<Name>.tsx` must have a matching `src/content/components/<slug>.doc.mdx`. Build fails otherwise.
- **Public JSON API + markdown bundles** emitted at build so any AI agent can ingest the library via `curl`.
- **No runtime server**. Pure static output.

---

## Phase 2 goal: Payload-backed admin with AI editor

The v1 USP is the public copy experience. Phase 2 adds the authoring flex: a chat-to-canvas admin inside the user's existing Payload instance (`studio.djasha.me`) that generates components via the Claude API and writes them to git.

### Architectural shape

```
┌──────────────────┐      Claude API       ┌──────────────────┐
│  Payload admin   │─────────────────────▶│  Claude (code    │
│  (studio.djasha  │                      │   generation)    │
│   .me)           │◀─────────────────────│                  │
└────────┬─────────┘                      └──────────────────┘
         │ afterChange hook (Octokit)
         ▼
┌──────────────────┐                      ┌──────────────────┐
│  GitHub commit   │──────── push ──────▶│  Vercel deploy   │
│  to djasha/      │                      │  system.djasha.  │
│  system main     │                      │   me             │
└──────────────────┘                      └──────────────────┘
```

### Required work

1. **Payload collection schema** mirroring `src/content.config.ts` shape. Same fields, same enum constraints — so the v1 Zod schemas and the Payload collection fields stay 1:1.
2. **Custom "Design" field type** in Payload admin:
   - Chat interface talks to Claude API (use prompt caching + `claude-sonnet-4.7` per the user's standard stack).
   - Canvas shows rendered component in sandboxed iframe.
   - "Publish" button writes source + doc.mdx to git via Octokit + Payload's `afterChange` hook.
3. **`npm run pull:payload`** script that hydrates local `src/content/` from Payload's REST API. Use this for dev; in production, the `afterChange` hook keeps git as source of truth so the static build stays reproducible.
4. **Auth gate**: Payload's native auth gates write access. Public visitors never interact with the admin.

### Why this sequencing

The public site (v1) is the artifact that gets shown to hiring managers, clients, and other designers. It must ship standalone — no Payload runtime dependency. Phase 2 layers authoring ergonomics on top.

---

## Known gaps in v1 (deferred to Phase 2 or later)

### Content gaps
- **0 patterns** — the `patterns` collection is wired up but has no seed entries. Editorial hero, case-study body, and filterable work grid are candidate patterns for Phase 2.
- **1 voice entry** — only "Headlines" is documented. Microcopy, error messages, CTA patterns are candidates.

### UX gaps
- **Tabs not SSR** — the `ComponentTabs` island hydrates on idle, so the tab strip appears after JS loads. No crawler-visible tab content in the SSR snapshot. Acceptable for v1; a Phase 2 enhancement could add a `<details>` progressive-enhancement fallback.
- **No component search within a detail page** — Command-K handles global search but there's no "jump to section" inside a long component doc.
- **Filter state not persisted in URL** — refreshing or sharing the `/components` page with filters applied loses them. Easy Phase 2 fix: sync filters to URL query params.
- **No dark/light theme inside the playground canvas** — the canvas has `dark/light/grid` background toggles but doesn't swap component-level tokens. Components styled with `var(--color-bone)` will read correctly; components with hardcoded hex won't.
- **No mobile sidebar drawer** on `/components` — desktop has a sticky sidebar, mobile collapses to stacked layout. A sheet-style drawer would be an improvement.
- **No OG image for non-component pages** — `/tokens`, `/voice`, `/about` fall back to generic og meta. Phase 2 could extend `astro-og-canvas` to cover top-level pages.

### Platform gaps
- **DNS**: `system.djasha.me` not yet pointed at Vercel. The Vercel-assigned `djasha-system.vercel.app` works. DNS switch is a Cloudflare A-record add (`76.76.21.21`) that the user does manually.
- **No analytics**: the plan mentioned Umami reuse but v1 ships without it. Add an Umami embed to `BaseLayout.astro` when ready.
- **No GitHub repo description or topics** — the repo is bare. A short description + topics (`astro`, `design-system`, `component-library`, `ai-native`) would help discovery.

### Technical debt
- **Zod deprecation hints** — Astro 6 re-exports `z` from `astro:content` marked as deprecated. Current code works but `astro check` shows 34 hints. Phase 2 cleanup: import `z` directly from `zod` in `src/content.config.ts`.
- **`npm audit` shows 5 moderate severities** in `@astrojs/check` transitive deps (yaml-language-server). Not exploitable (build-time tool, no user input), but worth refreshing when an upstream fix lands.
- **No e2e test coverage for tokens/voice/patterns pages** — Playwright smoke covers home, detail, bundle, tokens. Add patterns + voice tests in Phase 2.
- **Bundle generator duplication** — `composeBundle()` is called from both `src/pages/bundles/[slug].md.ts` and `src/pages/components/[slug].astro`. If the serialized format changes, both sites need the update. Fine for now; could extract a shared wrapper if the call sites grow.

### Authoring UX gaps (addressed by Phase 2)
- **No way to preview a component before it has a doc** — the CI guard blocks commits of orphan components. Authoring flow today is: write source → write doc → commit → build → preview. Phase 2's admin compresses this to: prompt → preview → publish.
- **No versioning UI** — git history is the version log. Fine for solo use; Phase 2 could expose a "version history" tab per component pulling from GitHub commits.
- **No component-level analytics** — which components get viewed, which Bundle tabs get copied? Useful signal for prioritizing what to document next.

---

## Phase 2 sequencing proposal (not scoped in detail yet)

A reasonable first pass, roughly in order:

1. Add Payload `components` / `patterns` / `tokens` / `voice` collections with the same field shape as v1 Zod schemas.
2. Write `pull:payload` script that materializes Payload entries into local `src/content/`.
3. Set up GitHub Actions trigger so a Payload publish emits a repository dispatch, which runs `pull:payload` + commits.
4. Only then: build the custom "Design" field type (chat + canvas + Claude API).
5. Migrate a few v1 components into Payload as the test case.
6. Ship Payload v2 alongside v1 (two write paths converge at git; public site unchanged).

Until step 6 ships, v1 continues to work untouched — authoring is terminal Claude Code + direct commits.

---

**Last updated:** 2026-04-22 (v1 ship)
