# Djasha System — v1 Design Spec

**Date:** 2026-04-20
**Status:** Approved for implementation planning
**Author:** Diaa Asha (<diaasha7@gmail.com>, <me@djasha.me>)

---

## 1. Overview

### What this is

A standalone design system library hosted at `system.djasha.me`. Public visitors browse, search, filter, and copy design tokens, components, patterns, and voice guidelines. Components ship with a live playground (tweakable color/motion knobs) and a tabbed copy surface (Preview / Code / Prompt / Bundle).

### Positioning

Not another shadcn clone. The differentiator: **built for AI-agent consumption**. Every component ships a natural-language prompt + a full-context bundle (prompt + resolved tokens + source + a11y notes) that a visitor pastes into Claude Code, Cursor, v0, or Bolt to port the component into their own stack in one paste.

### Working name & tagline

- **Name:** Djasha System
- **Tagline:** *An AI-native design system. Copy code, copy prompts, copy the whole bundle into any agent.*

### Audience (hybrid — A + B from brainstorm)

- **Primary (you):** precision reference so tokens/components stay consistent across work.
- **Secondary (hiring managers, clients):** public case study signalling systems thinking.
- **Tertiary (other designers/devs):** useful reference for AI-assisted builds.

### v1 scope

Library only. No AI-driven admin editor. Authoring is terminal Claude Code writing `.tsx`/`.mdx` files committed to git. Phase 2 layers Payload-backed admin on top (see §8).

---

## 2. Architecture

### Stack

- **Framework:** Astro 5 (`output: 'static'`)
- **Interactivity:** React islands with Astro hydration directives
- **Styling:** PostCSS + Tailwind (matches portfolio convention)
- **Fonts:** Geist Variable (UI), Space Grotesk (display), Geist Mono (code) — all self-hosted via `@fontsource-variable`
- **Search:** Fuse.js (client-side, fuzzy, over build-time JSON index)
- **Syntax highlighting:** Shiki (build-time)
- **OG images:** `astro-og-canvas` (build-time)
- **Analytics:** Umami (reuses existing deployment)

### Repo & hosting

- **GitHub:** `djasha/system` (new repo; not created yet)
- **Local path:** `/Users/Djasha/djasha-system`
- **Deploy:** Coolify on `srv840545`, auto-deploy on push to `main`
- **Domain:** `system.djasha.me`, TLS via Traefik on the main host (matches existing infra topology)
- **No runtime server.** Pure static output served behind CDN.

### Content source

Astro content collections, git-only for v1. Four collections:

1. `components`
2. `patterns`
3. `tokens`
4. `voice`

### Live preview mechanism

Components imported directly from `src/components/` into detail pages — same-origin, same bundle, no iframe. Rendered as a **React island** (`client:visible` or `client:idle`) so the initial HTML is static but interactive behaviour hydrates lazily. Per-component optional `<Name>.preview.tsx` provides demo props or setup context (needed for components like `HeroVideo`, `ScrollMarquee`, `SmoothScroll`). Generic fallback if absent.

---

## 3. Content model

### `src/content/components/<slug>.doc.mdx`

**Frontmatter (Zod-validated, all fields required unless noted):**

```yaml
name: MagneticButton
slug: magnetic-button                 # optional; auto-derived from filename
description: Button with cursor-proximity magnetic pull.
category: input                       # enum: input | display | navigation | layout | motion | overlay | feedback
tags: [motion, button]
tokens_used: [color.accent, motion.ease-out-quart, space.4]
related: [tilt-card, custom-cursor]   # slugs
status: stable                        # enum: stable | beta | experimental
source_path: src/components/MagneticButton.tsx    # required; drives Code tab + Bundle
a11y_notes: Respects prefers-reduced-motion. Focus ring uses outline, not transform.
created: 2026-04-20                   # ISO date; static after creation
```

**MDX body (prose sections, author-written):**

- `## Prompt` — the natural-language brief describing intent, behavior, constraints. Visitors copy this into AI agents.
- `## Usage` — when to use, when not to. Short.
- `## Do / Don't` — bullet pairs.

### Co-sibling files in `src/components/` (optional per component)

- **`<Name>.playground.tsx`** — exports `{ knobs, toCode(values) }`. Knobs are typed against the component's props. `toCode` returns a string representing the component with current knob values applied — so the copy button in the playground reflects tweaks.
- **`<Name>.preview.tsx`** — exports a `<Demo />` wrapper with sensible props/context. Generic wrapper used if absent.

> **Convention:** these co-sibling files sit next to the component file but are explicitly NOT counted as components by the doc-coverage CI check (see §5).

### Derived at build (no manual upkeep)

- **Preview tab content** — live React island of the component (via `.preview.tsx` wrapper when present).
- **Code tab content** — `source_path` file contents read at build, Shiki-highlighted.
- **Bundle tab content** — generated markdown at `public/bundles/<slug>.md`:

```markdown
# <Name>

<description>

## Prompt
<prose from ## Prompt section>

## Tokens
<list of tokens_used with resolved values>

## A11y
<a11y_notes>

## Source (<source_path>)
```<language>
<file contents>
```

## Usage
<prose from ## Usage section>
```

The forcing function for "keep docs up to date": the author writes only the Prompt/Usage/Do-Don't sections. Everything else derives from source + frontmatter. Drift becomes structurally impossible.

### Other collections

- **`patterns`** — mirrors `components`, adds `components_used: []`. Represents higher-order composition (e.g., "editorial hero", "case-study body").
- **`tokens`** — `{ category, name, value, tailwind_class?, css_var, description }`. Categories: color, type, space, radius, shadow, motion.
- **`voice`** — `{ topic, rules[], examples[{ good, bad }] }`.

---

## 4. Public UX

### Information architecture

- `/` — landing. Hero, "how to use with any AI" 3-step, featured components strip.
- `/components` — browse grid with search + filters.
- `/components/[slug]` — detail (core page).
- `/patterns` + `/patterns/[slug]`.
- `/tokens` — all tokens grouped by category, click-to-copy CSS var or Tailwind class.
- `/voice` — tone guide.
- `/about` — manifesto: why AI-first.
- `/api` — documents the machine-readable endpoints.

### Component detail page (core UX)

Laid out top-to-bottom:

1. **Header** — name, one-liner description, status badge, tags.
2. **Live playground** (above-fold):
   - Rendered component on a themed canvas.
   - Right-side knobs panel from `<Name>.playground.tsx`: color pickers, range sliders, variant dropdowns.
   - Canvas toggles: background (dark / light / transparent-grid), viewport (mobile / tablet / desktop).
   - Knob tweaks update the live render in real time (React island state → CSS custom properties on the previewed instance).
   - Playground collapsed by default on mobile; "Tweak" button opens a bottom drawer.
3. **Tabs — Preview / Code / Prompt / Bundle**:
   - Preview: full-width live render.
   - Code: Shiki-highlighted source. Copy button.
   - Prompt: the brief. Copy button + helper text: *"Paste into any AI agent."*
   - Bundle: one-click copy of `/bundles/<slug>.md`. Helper: *"Paste into Claude Code, Cursor, v0, or Bolt to port this into your stack."*
4. **Meta rail** (right side on desktop, stacked below tabs on mobile):
   - Tokens used — linked chips to `/tokens#<slug>`.
   - Related — linked cards.
   - A11y notes.
   - Last updated (derived from git history at build).
   - GitHub source link.
5. **Quick-launch row**:
   - **v0**: deeplink `v0.dev/?prompt=<url-encoded-bundle>`.
   - **Bolt**: deeplink `bolt.new/?prompt=<url-encoded-bundle>`.
   - **Claude Code** / **Cursor**: clipboard copy + toast ("Copied — paste into your terminal/editor") since neither supports URL-based prompt injection.

### Browse UX

- **Top bar**: Command-K search (Fuse.js, indexes names + descriptions + tags + prose). Keyboard-first, mouse-accessible.
- **Left sidebar** (md+, collapsible on mobile):
  - Category filter (single-select radio group).
  - Tag filter (multi-select).
  - Tokens filter (multi-select — "show everything using `color.accent`").
- **Grid**: cards with static mini-thumbnail + name + one-liner + category badge. Hover shows live mini-preview. Empty state when filters return nothing.

### Global

- **Top nav**: logo, Components, Patterns, Tokens, Voice, About, API, GitHub link.
- **Theme toggle**: dark default, light alt, respects `prefers-color-scheme`.
- **Motion**: respects `prefers-reduced-motion`. Playground motion knobs show an informational banner and are disabled when the user has reduced motion set.
- **Responsive**: mobile collapses sidebar to a sheet, playground knobs to a bottom drawer.
- **Keyboard**: every interaction reachable. Visible focus rings site-wide.

---

## 5. CI guards (forcing function for "keep docs up to date")

Three fail-closed checks run on every PR:

1. **Doc-coverage check** — every `src/components/<Name>.{tsx,astro}` must have a matching `src/content/components/<slug>.doc.mdx`. The check **excludes** files matching `*.playground.{tsx,jsx}` and `*.preview.{tsx,jsx}` (those are helpers, not components). Missing docs are named in the error output.
2. **Reference integrity** — every `tokens_used[]`, `related[]`, `components_used[]` entry must resolve. Orphan references fail the build with the referencing file + missing slug in the error.
3. **Frontmatter schema** — Zod schema per collection. Missing required fields or invalid enums fail before render.

**Bonus (warn, non-blocking)**: CI flags if a component file changed in the last 30 days but the matching `.doc.mdx` didn't — surfaces stale docs without blocking merges.

**GitHub Actions pipeline**: `astro check && npm run lint && npm run build` on every PR. Merge blocked on red.

---

## 6. Public JSON API

All static, emitted at build. No runtime server.

| Endpoint | Purpose |
|---|---|
| `/api/index.json` | Full manifest: `{ components, patterns, tokens, voice }` — summary fields only (slug, name, description, category, tags, status) |
| `/api/components/<slug>.json` | Full component: metadata + source as string + prompt + a11y + `tokens_used` resolved to values + `related` resolved |
| `/api/patterns/<slug>.json` | Same as component, adds resolved `components_used` |
| `/bundles/<slug>.md` | Copy-paste markdown bundle (same content as the Bundle tab) |
| `/search-index.json` | Fuzzy-search index for client-side Fuse.js |
| `/tokens.json` | All tokens keyed by `<category>.<name>` with values and Tailwind mappings |

The `/api` page on the public site documents this contract with copy-pasteable examples. Target use case: *`curl -s https://system.djasha.me/bundles/magnetic-button.md | pbcopy`*.

---

## 7. Visual direction

Leans on the portfolio's editorial-dark palette but gives this project its own gravity — reads as a product, not a portfolio section.

- **Palette**: shared `#0A0606` / `#F5F1EC` / `#E8462C`. Adds `#1A1210` for elevated surfaces (cards, tabs).
- **Type**: Geist Variable (UI) + Space Grotesk (display) + Geist Mono (code, tokens, API).
- **Density**: docs-grade — shadcn/Radix tempo, not editorial-magazine. Content max ~840px, generous inter-section spacing.
- **Motion**: restrained. Mini-preview hovers animate briefly. Tab switches cross-fade. No scroll-triggered effects on doc chrome. Components inside the playground still animate — that's the point.
- **Distinct brand mark**: small wordmark unique to this project (not the portfolio logo). Monospace-adjacent, technical feel.

---

## 8. Non-goals for v1 + Phase 2 hooks

### Non-goals (explicit YAGNI for v1)

- No runtime server or API calls at request time.
- No user accounts, comments, or public contribution flow.
- No Payload-backed admin editor in v1.
- No versioning/history UI (GitHub handles history).
- No multi-theme showcase beyond dark + light.
- No npm package publishing — this is a reference library, not a dependency.
- No visual canvas editor in admin. Authoring is terminal Claude Code.
- No analytics beyond basic Umami page views.

### Phase 2 hooks (designed into v1 so no rework)

- Content-collection schemas designed to map 1:1 to a future Payload collection. Phase 2 adds a `pull:payload` script that hydrates local content from Payload before build, then a custom "Design" block inside Payload admin that calls Claude API and writes both a Payload entry and a source file to GitHub.
- Bundle + API format frozen from day one — external integrations won't break on Phase 2.
- All build-time generation is idempotent — Phase 2 can add a webhook that rebuilds on Payload publish.
- `docs/phase-2-notes.md` in the repo captures deferred decisions as they're encountered during v1.

---

## 9. Success criteria for v1 (launch bar)

Minimums — not caps:

- [ ] Public site live at `system.djasha.me`, TLS green.
- [ ] At least 8 components migrated from portfolio (starting set candidates: MagneticButton, TiltCard, ScrollMarquee, CustomCursor, StackingCards, ParallaxImage, CharacterReveal, AnimatedText — final list picked at implementation kickoff).
- [ ] All 4 tabs functional on every migrated component: Preview, Code, Prompt, Bundle.
- [ ] Playground knobs working on at least 4 components.
- [ ] Command-K search returns relevant results for component + token + prose queries.
- [ ] CI guards block merges on doc-coverage / reference / schema failures.
- [ ] `/api/*.json` and `/bundles/*.md` endpoints resolve and validate against documented shapes.
- [ ] OG images generated for every component detail page.
- [ ] Mobile responsive on all pages.
- [ ] Passes WCAG AA keyboard-navigation check.

---

## 10. Key risks & mitigations

| Risk | Mitigation |
|---|---|
| Direct component imports break when a component has expensive runtime deps (video, GSAP, SmoothScroll) | Per-component `.preview.tsx` wrappers isolate setup and provide demo props |
| Live-imported components slow initial page load | Astro hydration directives (`client:visible`, `client:idle`) defer interactive islands |
| Code tab drift from actual source | Code is read at build from `source_path` — structurally impossible to drift |
| Bundle gets too large to paste into chat-based agents (token limits) | Monitor bundle sizes in CI, warn on files >8KB; consider URL-only references in the bundle for very large components |
| Phase 2 Payload schema diverges from v1 content schema | Content schemas in `src/content.config.ts` are the source of truth; Phase 2 derives Payload collections from them, not the reverse |
| "Keep docs up to date" CI becomes annoying during refactors | Bonus stale-doc check is non-blocking; only coverage/integrity/schema checks block merges, and those are trivial to satisfy |
| Custom cursor / smooth scroll effects conflict with each other across components on the same page | Detail page renders only one component at a time; browse grid uses static thumbnails by default, live mini-previews only on hover |

---

## 11. Open questions (non-blocking for spec approval)

- **DNS** — confirm `system.djasha.me` has no existing record before implementation kickoff.
- **Brand mark** — wordmark/glyph design deferred to implementation, not blocking spec approval.
- **Initial component set** — the 8 listed in §9 are a starting guess based on the portfolio's most distinctive components; final list chosen at kickoff.
- **Umami site ID** — reuse portfolio's property or register a separate one? Lean: separate, for isolated analytics.

---

## Appendix A — Reference design systems studied

| System | What we take from it |
|---|---|
| shadcn/ui docs | Tabbed Preview/Code pattern, Command-K, copy-button affordance |
| Radix Docs | Rigor of API tables (future phase), fuzzy Command-K |
| Vercel Geist docs | Token pages with click-to-copy, monospace emphasis |
| Aceternity UI | Live playground knobs, motion-forward previews |
| Atlassian Design System | Patterns + usage guidance + do/don't pairs |
| Claude Design (Anthropic, 2026-04-18) | Chat-driven authoring vibes (deferred to Phase 2) |

---

## Appendix B — Brainstorm decision trail

Summary of the decisions that shaped this spec, for future reference:

| Decision point | Chosen | Alternative considered |
|---|---|---|
| Audience | Hybrid (self + public case study) | Self-only, public-only, open-source |
| Content surface | Tokens + components + patterns + voice | Tokens only, tokens + components |
| Copy model | Tabbed: Preview / Code / Prompt / Bundle | Code-only, prompt pack only, full bundle only |
| Admin authoring | Terminal Claude Code (v1); Payload "Design block" (Phase 2) | Local-only Claude Code forever; standalone admin panel; Sanity Studio |
| CMS choice | Payload (Phase 2), sharing studio.djasha.me | Sanity, Keystatic, custom |
| v1 scope cut | Library only | Library + minimal Design block; full vision |
| Architecture | Git-first, Astro content collections | Payload-from-day-one |

---

**Next step:** invoke `writing-plans` skill to produce a phased implementation plan once the user reviews and approves this spec.
