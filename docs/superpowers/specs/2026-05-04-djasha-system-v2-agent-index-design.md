# Djasha System v2 — Agent Discovery Index

**Date:** 2026-05-04
**Status:** Approved for implementation planning (revised after Open Design vendoring decision)
**Author:** Diaa Asha (<diaasha7@gmail.com>, <me@djasha.me>)
**Builds on:** [v1 design spec](./2026-04-20-djasha-system-design.md) (shipped 2026-04-22)

---

## 1. Overview

### What this is

A v2 extension of `djasha-system`. Same domain (`system.djasha.me`), same brand, same content-as-git architecture. The *content* expands dramatically — through Apache-2.0 vendoring of Open Design's bundled catalog — and the *discoverability* layer becomes agent-native.

The goal: when an AI agent (Claude Code, Cursor, ChatGPT search, Perplexity, Gemini, Codex, etc.) needs ANY design system reference — whether yours, Linear's, Stripe's, or a workflow skill — this library is the first hit.

### Positioning shift

**v1 said:** *"AI-native design system. Copy code, copy prompts, copy the whole bundle into any agent."*
**v2 says:** *"The agent-first index of design systems and design skills. Yours, theirs, all of them."*

v1 made the bundles agent-consumable. v2 (a) ingests Open Design's already-curated catalog of 72 design systems + 31 skills + 5 visual directions; (b) wraps everything in agent-discovery layers (`/llms.txt`, `/llms-full.txt`, schema.org, MCP server, OpenAPI, AI-bot allow-list).

The MCP server is the differentiator — agents in Claude Code / Cursor / Codex install once, then have search + fetch tools across **all 100+ entries** as native tool calls.

### Audience

Same as v1, with priorities reshuffled:

- **Primary (NEW):** AI agents and AI-search crawlers — Claude Code/Cursor/Codex MCP clients, ChatGPT search index, Perplexity, Gemini, Bing AI, GPTBot, ClaudeBot, etc.
- **Secondary:** designers/devs using AI agents who arrive at the library via agent recommendation.
- **Tertiary:** humans browsing directly (v1 use case — still important).
- **Quaternary (you):** personal authoring tool, now with Open Design installed locally.

### v2 scope

Three parallel work streams:

1. **Agent-discovery layer** — `/llms.txt`, `/llms-full.txt`, schema.org JSON-LD, MCP server with expanded tool list, OpenAPI, robots.txt allow-list, sitemap improvements.
2. **Originals content depth** — migrate 7–12 more components from the portfolio, seed 3–5 patterns, seed 5–7 voice entries (your work, your craft signal).
3. **Vendored catalog** — Apache-2.0 ingestion from `nexu-io/open-design`: 72 design systems, 31 skills, 5 visual directions. Visually distinct from Originals. Attribution preserved upstream-by-upstream. Auto-syncable.

Plus a side track: install Open Design locally for personal authoring.

### Explicit non-goals

- ❌ SaaS, billing, accounts, multi-tenant authoring (deferred to a future v3, possibly forever).
- ❌ Open Design's **runtime features** — chat-to-canvas UI, sandboxed iframe daemon, BYOK proxy, Electron shell, agent-CLI auto-detection. We vendor their *content*, not rebuild their *app*.
- ❌ Hosted Open Design as a public service.
- ❌ Independently curated references (writing our own bundles for Linear, Stripe, etc. from scratch). The Open Design dataset is the curated set we use.
- ❌ HyperFrames runtime (separate Heygen tool — defer).
- ❌ Brand change. Stays Djasha System on `system.djasha.me`.

### Success bar

Functional: an agent in Claude Code installs the MCP server with one command and can answer *"give me a magnetic button using djasha-system tokens"* AND *"give me a SaaS landing using Linear's design system"* without any web call.

Discovery: a search like *"design system MCP"* or *"AI design system index"* on Perplexity / ChatGPT search / Bing returns this library in the first 3 results within 90 days of v2 launch.

Catalog: ≥ 15 Originals + ~72 References + ~31 Skills + 5 Directions = **~123 indexable entries**.

---

## 2. Architecture additions

v1 architecture is preserved entirely. v2 adds three layers: discovery surfaces, expanded content collections, and a vendoring pipeline.

### 2.1 Discovery surfaces

| Surface | Type | Location | Purpose |
|---|---|---|---|
| `/llms.txt` | Static text endpoint | `src/pages/llms.txt.ts` | Concise LLM-readable site index per the [llms.txt spec](https://llmstxt.org/) |
| `/llms-full.txt` | Static text endpoint | `src/pages/llms-full.txt.ts` | Full content dump for non-crawling agents (paginated if large) |
| Schema.org JSON-LD | Embedded `<script type="application/ld+json">` | `BaseLayout.astro` per-page slot | `WebSite`, `SoftwareSourceCode`, `CreativeWork`, `BreadcrumbList`, `ItemList` — page-type-specific |
| `/.well-known/mcp` | Static JSON | `src/pages/.well-known/mcp.json.ts` | MCP discovery manifest pointing to `/mcp` |
| `/mcp` | HTTP MCP server | Vercel serverless function (TypeScript) | The actual MCP transport endpoint |
| `/openapi.json` | Static JSON | `src/pages/openapi.json.ts` | OpenAPI 3.1 spec for the JSON API (v1 endpoints + v2 additions) |
| `/robots.txt` | Static text | `src/pages/robots.txt.ts` (replaces default) | Explicit allow-list for major AI bots |
| `/ai.txt` | Static text | `src/pages/ai.txt.ts` | Emerging companion to robots.txt for AI-specific rules |
| `/sitemap-images.xml` | Static XML | Astro sitemap config + custom builder | OG images + component preview thumbnails for image search |
| `/.well-known/llm` | Static text alias | redirect or copy of `/llms.txt` | Belt-and-braces — different agents look in different places |

### 2.2 New content collections (v2)

Three new collections in `src/content.config.ts`:

| Collection | Source | Purpose | Size |
|---|---|---|---|
| `references` | Vendored from `nexu-io/open-design` `design-systems/` | Public design systems (Linear, Stripe, Vercel, etc.) with attribution chains | ~72 entries |
| `skills` | Vendored from `nexu-io/open-design` `skills/` | Agent workflows / prompt templates (web-prototype, saas-landing, deck modes, etc.) | ~31 entries |
| `directions` | Vendored from `nexu-io/open-design` `apps/web/src/prompts/directions.ts` | 5 visual schools (Editorial Monocle / Modern Minimal / Warm Soft / Tech Utility / Brutalist Experimental) — palette + font stack | 5 entries |

Existing v1 collections (`components`, `patterns`, `tokens`, `voice`) preserved unchanged.

### 2.3 New page types

| Route | Type | Renders |
|---|---|---|
| `/references` | Astro page | Browse grid of all 72 references with category/owner filters |
| `/references/[slug]` | Astro dynamic page | Per-reference detail: palette, type, components list, source link, attribution chain |
| `/skills` | Astro page | Browse grid of all 31 skills, grouped by mode (`prototype` / `deck` / `template`) and scenario |
| `/skills/[slug]` | Astro dynamic page | Skill detail: prompt body, example HTML iframe, design-system requirements, attribution |
| `/directions` | Astro page | All 5 visual directions with palette swatches and font specimens |
| `/integrations` | Astro page | Documents MCP install, OpenAPI, llms.txt, etc. — how agents connect |

### 2.4 Vendoring pipeline

A new `scripts/sync-open-design.ts` script that:

1. Clones `nexu-io/open-design` to a temp directory (shallow, single branch).
2. Walks `design-systems/`, `skills/`, parses each entry's `DESIGN.md` / `SKILL.md` + frontmatter.
3. Writes parsed entries into `src/content/{references,skills,directions}/<slug>.yaml`.
4. Copies upstream `LICENSE` + `NOTICE` files into `vendor/open-design/` (preserved alongside our content for legal compliance).
5. Records source SHA + sync timestamp in each entry's frontmatter.
6. Idempotent — running twice with the same upstream produces the same output.

Run modes:
- `npm run sync:open-design` — manual, locally.
- GitHub Actions workflow `vendor-sync.yml` — runs monthly via cron, opens a PR titled "chore(vendor): sync open-design" if upstream changes.

The script never silently overwrites — if a vendored entry has been edited locally (detected via a checksum comment), it logs a conflict and skips, requiring manual resolution.

### 2.5 Tech stack additions

- `@modelcontextprotocol/sdk` (TypeScript) for the MCP server.
- Vercel **serverless function** for `/mcp` (MCP needs a runtime — can't be statically generated). All other v2 endpoints are static.
- `simple-git` (or shell `git clone`) for the vendoring script.
- `js-yaml` (already installed) for parsing/writing YAML frontmatter.
- No new framework, no new client-side libraries.

---

## 3. Agent-discovery surfaces — detailed

### 3.1 `/llms.txt`

Per the [llms.txt spec](https://llmstxt.org/), this is a single Markdown file at the site root that gives LLMs a high-level map of the site.

Format (illustrative shape — final ordering and prose to match the spec):

```markdown
# Djasha System

> An AI-native design system. Curated component library, machine-readable bundles, MCP server. Built for AI agents to read first.

## Components

- [MagneticButton](https://system.djasha.me/components/magnetic-button): Button with cursor-proximity magnetic pull.
- [TiltCard](https://system.djasha.me/components/tilt-card): 3D perspective tilt card.
- [AnimatedText](https://system.djasha.me/components/animated-text): Word-by-word staggered text reveal.
… (full list)

## Tokens

- [color.accent](https://system.djasha.me/tokens#color.accent): #E8462C — primary accent color.
… (full list)

## API

- [JSON manifest](https://system.djasha.me/api/index.json): Catalogue of all entries.
- [Per-component JSON](https://system.djasha.me/api/components/<slug>.json): Full component metadata + source.
- [Bundle markdown](https://system.djasha.me/bundles/<slug>.md): One-paste bundle for AI agents.
- [MCP server](https://system.djasha.me/mcp): Model Context Protocol endpoint.
- [OpenAPI](https://system.djasha.me/openapi.json): OpenAPI 3.1 spec.

## Optional

- [Voice guide](https://system.djasha.me/voice)
- [Patterns](https://system.djasha.me/patterns)
```

Generated from the same content collections at build time. Updates automatically when content changes.

### 3.2 `/llms-full.txt`

Full content dump — every component's prompt + tokens + source code inline, in a single addressable URL. For agents that don't crawl per-page and need everything in one fetch.

Generated from the same `composeBundle()` logic, concatenated with section dividers. Cap individual entries at the bundle size already enforced; if total file exceeds some threshold (~500KB), split into `/llms-full-001.txt`, `/llms-full-002.txt` etc. with an index at `/llms-full.txt`.

### 3.3 Schema.org JSON-LD

`BaseLayout.astro` accepts a `jsonLd` prop. Each page type emits the right shape:

- **Home (`/`)** — `WebSite` with `potentialAction` (search), `publisher` (you), `sameAs` (GitHub, djasha.me).
- **`/components`** — `ItemList` of all components, each as `SoftwareSourceCode`.
- **`/components/[slug]`** — `SoftwareSourceCode` with `programmingLanguage`, `codeRepository` (GitHub link), `creator`, `license`, `keywords` (tags), and a custom `additionalType` of `https://djasha.me/schema/DesignSystemComponent`.
- **`/tokens`** — `Dataset` with each token as a `PropertyValue`.
- **`/voice`** — `Article` per topic.
- **`/about`** — `AboutPage`.
- **All pages** — `BreadcrumbList` for nav context.

Validate against [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org validator](https://validator.schema.org/) at build time (or in CI).

### 3.4 MCP server (the differentiator)

**Why this is the bet:** every static design system has JSON. Nobody (as of 2026-05-04) has a *Model Context Protocol* server. When agents in Claude Code / Cursor / Codex run `/mcp install system.djasha.me/mcp`, the library becomes a **tool the agent calls directly** — no copy/paste, no curl. Eliminates the friction step. With 100+ entries spanning Originals + References + Skills + Directions, the agent gets a full design palette in one tool registration.

**Tools exposed (v2 expanded set):**

*Originals (your work):*

| Tool name | Description | Inputs | Output |
|---|---|---|---|
| `search_components` | Fuzzy search across Originals by name, description, tags, body | `query: string`, `limit?: number` | `{ slug, name, description, category, tags, score }[]` |
| `get_component` | Fetch a full Original component | `slug: string` | Same object as `/api/components/<slug>.json` |
| `get_bundle` | Fetch the markdown bundle for a component | `slug: string` | Markdown string |
| `list_patterns` | List Original patterns | (none) | `{ slug, name, description, components_used }[]` |
| `list_tokens` | List tokens, optionally filtered by category | `category?: 'color' \| 'type' \| 'space' \| 'radius' \| 'shadow' \| 'motion'` | `{ slug, name, value, description }[]` |
| `get_token` | Fetch one token's full record | `slug: string` | Full token object |
| `find_by_token` | Find all components/patterns using a given token | `tokenSlug: string` | `{ components: [...], patterns: [...] }` |
| `get_voice` | Fetch a voice entry by topic slug | `slug: string` | `{ topic, description, rules, examples }` |

*References (vendored design systems):*

| Tool name | Description | Inputs | Output |
|---|---|---|---|
| `search_references` | Search across the 72 vendored design systems | `query: string`, `limit?: number` | `{ slug, name, owner, palette_summary, score }[]` |
| `get_reference` | Fetch a full reference (palette, type, components-list, attribution) | `slug: string` (e.g., `linear`, `stripe`) | Full reference object |
| `list_references` | List all references, optionally filtered | `category?: string` | `{ slug, name, owner }[]` |

*Skills (agent workflows):*

| Tool name | Description | Inputs | Output |
|---|---|---|---|
| `list_skills` | List all 31 skills, grouped by mode + scenario | `mode?: 'prototype' \| 'deck' \| 'template'`, `scenario?: string` | `{ slug, name, mode, scenario, description }[]` |
| `get_skill` | Fetch a full skill — prompt body, example HTML URL, design-system requires | `slug: string` | Full skill object |
| `find_skill_for_scenario` | Recommend a skill given a brief | `brief: string` (e.g., "make a SaaS landing"), `mode?: string` | `{ slug, name, why_recommended }[]` (top 3) |

*Directions (visual schools):*

| Tool name | Description | Inputs | Output |
|---|---|---|---|
| `list_directions` | List the 5 visual directions with palette + fonts | (none) | `{ slug, name, palette, fonts, vibe }[]` |
| `apply_direction` | Get the deterministic palette + fonts for a direction (for use in generation) | `slug: string` | `{ palette: { ... }, fonts: { ... }, motion?: { ... } }` |

*Cross-cutting:*

| Tool name | Description | Inputs | Output |
|---|---|---|---|
| `find_design_system` | Search across both Originals AND References | `query: string`, `limit?: number` | `{ type: 'original' \| 'reference', slug, name, score }[]` |
| `compose_brief` | Take a user prompt + recommend a skill + direction + reference | `prompt: string` | `{ skill, direction, reference, rationale }` |

**Resource exposure:**

- Per-component bundle: `mcp://system.djasha.me/components/<slug>`
- Per-reference DESIGN.md: `mcp://system.djasha.me/references/<slug>`
- Per-skill prompt + example: `mcp://system.djasha.me/skills/<slug>`
- Full manifest: `mcp://system.djasha.me/manifest`

**Transport:** HTTP-streaming (Vercel serverless function with `Streamable HTTP` transport from `@modelcontextprotocol/sdk`). Stateless — no auth, no sessions. Public read-only.

**Discovery:** `/.well-known/mcp` returns the MCP manifest (`endpoint`, `name`, `description`, `version`, `tools_count`) so agents that look in well-known can find it.

### 3.5 OpenAPI spec

`/openapi.json` returns OpenAPI 3.1 definition of the existing v1 API: `/api/index.json`, `/api/components/<slug>.json`, `/api/patterns/<slug>.json`, `/tokens.json`, `/bundles/<slug>.md`, `/search-index.json`. Generated at build time from a hand-written TypeScript schema (mirrors the Zod schemas already in `src/content.config.ts`).

### 3.6 robots.txt + ai.txt

`/robots.txt` (replaces Astro default):

```
User-agent: *
Allow: /

# Major AI search bots — explicitly allowed
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Cohere-AI
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://system.djasha.me/sitemap-index.xml
```

`/ai.txt` (emerging spec, similar to robots.txt for AI training/usage rules):

```
# Djasha System — AI usage policy
# Library content is licensed for AI agent consumption with attribution.

allow: read, search, summarize, embed, mcp-tool-call
prefer: link-back-to-source
attribution: "https://system.djasha.me"
license: see https://github.com/djasha/system/blob/main/LICENSE
contact: me@djasha.me
```

### 3.7 Sitemap improvements

- Switch to a dual sitemap: `sitemap-index.xml` referencing `sitemap-pages.xml` and `sitemap-images.xml`.
- `sitemap-pages.xml` includes `<lastmod>` derived from git history, plus `<changefreq>` hints.
- `sitemap-images.xml` includes every OG image and component preview thumbnail for image search engines.

---

## 4. Content depth

The agent-discovery layer is necessary but not sufficient — agents rank by content density too. v2 grows the catalog through a mix of authored Originals and Apache-2.0 vendored content.

### 4.1 Originals — components to migrate (~7–12 more)

Sourced from `/Users/Djasha/portfolio-remake/site/src/components/`. Ordered by impact (most distinctive first):

1. `TextMaskReveal` — masked typographic intro
2. `ScrollProgress` — top scroll indicator
3. `HeroGallery` — multi-image hero grid
4. `ToolTicker` — skills/tools horizontal marquee
5. `Expandable` — disclosure animation
6. `Figure` — semantic image with caption
7. `ImageGrid` — masonry/uniform image grid
8. `ProjectCard` — case-study card
9. `MagneticCTA` — composite of MagneticButton in CTA position (pattern candidate)
10. `SectionHeading` — typographic primitive
11. `ProseHeading` — markdoc-driven heading
12. `SubHeading` — supporting heading

Final list picked at implementation kickoff. Target 15–20 total Originals after v2.

### 4.2 Originals — patterns to seed (~3–5)

The spec called for patterns; v1 shipped zero. Patterns compose primitives:

1. **Editorial Hero** — uses `TextMaskReveal` + `MagneticButton` + `HeroGallery`. The "magazine landing" pattern.
2. **Case Study Body** — uses `ProseHeading` + `Figure` + `ImageGrid` + `Expandable`. The long-form work doc pattern.
3. **Filterable Work Grid** — uses `ProjectCard` + filter chrome + Command-K integration.
4. *(optional)* **Process Section** — uses `StackingCards` + `AnimatedText`.
5. *(optional)* **Brand Ribbon** — uses `ScrollMarquee` + `ToolTicker`.

### 4.3 Originals — voice entries to seed (~5–7)

v1 shipped only "Headlines". Add:

1. **Microcopy** — button labels, link text, form hints.
2. **Error messages** — tone, structure, recovery guidance.
3. **CTAs** — calls to action, tested language patterns.
4. **Empty states** — what to say when there's nothing to show.
5. **Onboarding copy** — first-run, welcome, setup.
6. *(optional)* **Loading states** — skeleton labels, spinners, progress copy.
7. *(optional)* **Confirmations** — destructive-action prompts, success toasts.

### 4.4 References — vendored from Open Design (~72 design systems)

Sourced from [`nexu-io/open-design`](https://github.com/nexu-io/open-design) under Apache-2.0. Each entry is a public design system that Open Design has already curated (with their own attribution chain back to the original system owners). We re-distribute with full attribution.

**Per-entry shape (Zod schema):**

```ts
{
  name: string;                    // e.g., "Linear"
  slug: string;                    // e.g., "linear"
  owner: string;                   // e.g., "Linear Team"
  source_url: string;              // upstream source (e.g., linear.app)
  design_md_path: string;          // path to vendored DESIGN.md
  category: string;                // e.g., "saas", "consumer", "developer-tools"
  palette: Record<string, string>; // OKLch or hex tokens
  fonts: { display: string; body: string; mono?: string };
  motion?: Record<string, string>;
  components: string[];            // names of components defined in DESIGN.md
  tags: string[];
  attribution: {
    upstream: string;              // "nexu-io/open-design"
    upstream_license: "Apache-2.0";
    upstream_sha: string;          // git SHA at sync time
    upstream_path: string;         // e.g., "design-systems/linear/"
    original_owner_url?: string;   // back-link to the original company
    last_synced: string;           // ISO date
  };
}
```

**Visual treatment:** distinct from Originals. Reference cards have a subtle "Reference" badge and a non-accent border color. The detail page header reads "Reference: <Name>" not "<Name>" alone, and includes an attribution rail with upstream + original-owner credits.

**Legal posture:** Apache-2.0 redistribution with attribution preserved. Upstream `LICENSE` and `NOTICE` files copied verbatim into `vendor/open-design/` and linked from each rendered reference page. If any individual design system later requests removal, we honor it via a takedown process documented in `docs/takedown.md`.

**Sync cadence:** monthly, automated via GitHub Actions; manually triggerable. The sync script never auto-merges — it opens a PR titled "chore(vendor): sync open-design <upstream-sha>" for review.

### 4.5 Skills — vendored from Open Design (~31 agent workflows)

Sourced from `nexu-io/open-design` `skills/` under Apache-2.0. Each skill is a curated agent prompt + example HTML output.

**Per-entry shape:**

```ts
{
  name: string;                    // e.g., "saas-landing"
  slug: string;
  mode: "prototype" | "deck" | "template";
  scenario: string;                // "design" | "marketing" | "operation" | "engineering" | etc.
  description: string;
  prompt_body: string;             // the SKILL.md prompt content
  example_html_path: string;       // vendored example.html for the iframe preview
  design_system_requires?: string; // optional dependency on a specific reference
  default_for?: string[];          // brief patterns this skill handles by default
  featured: boolean;
  fidelity?: "low" | "medium" | "high";
  speaker_notes?: boolean;
  animations?: boolean;
  example_prompt?: string;
  attribution: { /* same shape as references */ };
}
```

**Visual treatment:** the `/skills/<slug>` detail page renders the example HTML in a sandboxed iframe (same pattern as the Open Design app uses), shows the prompt body in a copyable code block, lists design-system requirements if any, and exposes a "Use via MCP" snippet.

**Agent integration:** the MCP `find_skill_for_scenario` tool recommends a skill from a free-text brief. `get_skill` returns the full prompt + example HTML URL so an agent in Claude Code can prompt → render → iterate.

### 4.6 Directions — vendored from Open Design (5 visual schools)

Sourced from `nexu-io/open-design` `apps/web/src/prompts/directions.ts`. Five entries:

1. **Editorial Monocle** — magazine, serif/grotesque, restrained palette
2. **Modern Minimal** — geometric, sans-only, generous whitespace
3. **Warm Soft** — organic curves, warm neutrals, soft shadows
4. **Tech Utility** — monospace + grotesque, dense, high info density
5. **Brutalist Experimental** — raw type, hard edges, color collisions

**Per-entry shape:** name, palette (OKLch values for primary/bg/fg/accent), font_stack (display + body + optional mono), motion defaults, vibe description.

**Use:** the MCP `apply_direction` tool returns a deterministic palette + font stack so an agent generating a new design picks one curated school instead of free-styling.

### 4.7 Independent References (NOT in v2)

Hand-curating new design system entries beyond what Open Design ships is **explicitly out of scope**. Solo effort + legal/attribution risk + maintenance cost. If a system isn't in Open Design's `design-systems/` folder, it's not in our References catalog. A future v3 (multi-tenant) could open submission for community-contributed References.

---

## 5. Local authoring with Open Design

Side track — single-developer install, not a public service.

### 5.1 What

Install Open Design ([nexu-io/open-design](https://github.com/nexu-io/open-design)) locally. Configure it to recognize Djasha System as a local design system (using its `design-systems/<name>/DESIGN.md` convention). Use it for prompted authoring of new components.

### 5.2 Why

- Faster authoring loop than terminal Claude Code for visual components: prompt → sandboxed iframe preview → tweak → save.
- Hands-on understanding of Open Design's architecture before deciding whether the SaaS layer (deferred to v3-or-later) is worth pursuing.
- Outputs land in the djasha-system repo as committed `.tsx` + `.doc.mdx` files via the existing scaffolder.

### 5.3 What's needed

1. Local install: `git clone https://github.com/nexu-io/open-design.git` + `pnpm install` + `pnpm tools-dev`.
2. Configure a `design-systems/djasha-system/DESIGN.md` (in Open Design's directory, NOT in djasha-system) that points back at `https://system.djasha.me/api/*.json` and inlines the token palette + type stack so Open Design's prompts use them.
3. Output handoff: when Open Design produces a component, copy the `.tsx` source to `djasha-system/src/components/`, then run `npm run scaffold -- <Name>` in djasha-system to create the doc/playground/preview stubs.
4. No automated round-trip in v2 — the handoff is manual. v3 (if pursued) could automate via a webhook or git plugin.

### 5.4 Scope of Open Design install in v2 work

- Install + first authoring trial (not maintaining as a service).
- Document the manual handoff in `docs/authoring-with-open-design.md`.
- Out of v2: integration testing, multi-user features, deploying Open Design publicly.

---

## 6. Public UX changes

v2 adds three new browse surfaces and a few small chrome adjustments. v1 layout/aesthetic unchanged.

### 6.1 New pages

- **`/references`** — browse grid of the 72 vendored design systems. Filters: category, owner, palette (single dominant color filter), free-text search. Cards show palette swatch + system name + owner. Cards are visually distinct from `/components` cards (Reference badge + softer border).
- **`/references/[slug]`** — detail page: header with name + owner + Reference badge, palette grid, font specimens, components list (linked to source), source link to original system, attribution rail with upstream chain, "Use via MCP" snippet.
- **`/skills`** — browse grid of the 31 skills. Filters: mode (prototype/deck/template), scenario (design/marketing/etc.), required design system. Cards show skill name + scenario + featured indicator.
- **`/skills/[slug]`** — detail page: prompt body in a copyable code block, sandboxed iframe rendering the bundled example HTML, design-system requirements (if any), MCP install snippet for `get_skill`, attribution.
- **`/directions`** — single page showing all 5 visual directions side by side. Each panel: palette swatches, font specimens, sample heading rendered in the direction's style. Click → expanded view.
- **`/integrations`** — documents MCP install (one-line snippets per client: Claude Code, Cursor, Codex), OpenAPI usage, `llms.txt` for agents that don't speak MCP, attribution policy.

### 6.2 Chrome adjustments

- **Top nav** gains 2 entries: "References" and "Skills" (after "Patterns", before "Tokens"). Small visual indicator (subtle dot) marks vendored sections as distinct from authored ones.
- **Home page hero** adds a subtle "MCP-ready" badge and a stat strip: "8 Originals · 72 References · 31 Skills · 5 Directions · 1 MCP server."
- **Each detail page** (Originals + References + Skills) adds a "Use via MCP" link in the meta rail explaining the one-line install.

### 6.3 No layout/style overhaul

The v1 dark editorial aesthetic, type stack, motion treatment, and component density stay unchanged. References and Skills inherit the same chrome with one consistent visual differentiation: a "Reference"/"Skill" badge and a slightly muted border. No theme variants.

---

## 7. CI guards (additive)

Three new fail-closed checks in `npm run check:all`:

1. **llms.txt validator** — ensures `/llms.txt` parses against the published spec; every link in it must resolve to a 200.
2. **Schema.org validator** — runs JSON-LD on each page through a local validator (using `schema-dts` types + a small custom validator) to catch malformed structured data at build time.
3. **Vendor attribution check** — every entry in `references`, `skills`, `directions` must have a complete `attribution` block (upstream, upstream_license, upstream_sha, upstream_path, last_synced). Missing fields fail the build. Catches incomplete syncs and accidental edits to attribution metadata.

Two non-blocking checks:

4. **MCP server contract test** — Playwright spec that boots `vercel dev`, hits `/mcp` with a known MCP client, asserts the tool list and one tool call per category (Originals + References + Skills + Directions). Skipped on CI if Vercel CLI isn't available; runs in a follow-up `npm run test:mcp` step.
5. **Vendor sync drift warning** — non-blocking warning when upstream `nexu-io/open-design` has commits since our last sync. Surfaces in CI output. The monthly cron handles the actual sync.

Existing v1 guards (doc-coverage, reference-integrity, frontmatter schema) preserved unchanged.

---

## 8. Public API stability

The v1 endpoints (`/api/index.json`, `/api/components/<slug>.json`, `/tokens.json`, `/bundles/<slug>.md`, `/search-index.json`) are **frozen** — already documented as stable. v2 only ADDS surfaces.

The new MCP tool list is versioned via the manifest (`/.well-known/mcp` returns `version: "1"`). Tool additions are backward-compatible; tool removals or signature changes bump the version.

---

## 9. Success criteria for v2

Functional:

- [ ] `/llms.txt` and `/llms-full.txt` exist, validate against [llmstxt.org](https://llmstxt.org/) format.
- [ ] Schema.org JSON-LD on every page passes Google Rich Results Test and Schema.org validator with zero errors.
- [ ] MCP server at `/mcp` passes the official `mcp inspector` self-test.
- [ ] At least 3 MCP clients (Claude Code, Cursor, Codex) can install and call: `search_components`, `get_bundle`, `search_references`, `get_reference`, `find_skill_for_scenario`, `apply_direction` end-to-end.
- [ ] OpenAPI spec at `/openapi.json` validates against OpenAPI 3.1.
- [ ] `robots.txt` + `ai.txt` live; major AI bots not blocked.
- [ ] Catalog size: ≥ 15 Originals + ~72 References + ~31 Skills + 5 Directions = **≥ 123 indexable entries**.
- [ ] Vendoring pipeline: `npm run sync:open-design` runs end-to-end, ingests the upstream catalog, opens a clean PR. Monthly GitHub Actions cron configured.
- [ ] Vendor attribution: every reference + skill page renders a visible attribution rail with upstream + original-owner credits. `vendor/open-design/LICENSE` + `NOTICE` files present and linked.

Discovery (90-day post-launch):

- [ ] Indexed by Google Search Console with all pages submitted.
- [ ] Surfaces in Perplexity / ChatGPT search / Bing AI when querying "design system MCP", "AI design system index", "AI-native component library", or similar.
- [ ] Top-3 result for `"djasha system"` brand search across major engines.
- [ ] Surfaces for at least 5 vendored references (e.g., "Linear design system reference") in agent-search results — proves vendored content drives traffic.

Authoring:

- [ ] Open Design installed locally, one component authored end-to-end through it as proof of loop.

Legal / hygiene:

- [ ] Apache-2.0 LICENSE + NOTICE files preserved in `vendor/open-design/`.
- [ ] Takedown process documented in `docs/takedown.md`.
- [ ] Each rendered reference + skill page has visible attribution to upstream + (where known) original system owner.

---

## 10. Key risks & mitigations

| Risk | Mitigation |
|---|---|
| `/llms.txt` is an emerging standard; format may shift | Generated programmatically — can re-emit with one CI tweak. Track `llmstxt.org` |
| MCP HTTP transport spec evolves | `@modelcontextprotocol/sdk` insulates us from low-level transport changes; version the manifest |
| Vercel serverless function cold starts hurt MCP latency | Edge function + lightweight handler; keep the SDK + tool list small |
| AI search ranking is opaque — discovery work might not move ranking | Track via Search Console + Perplexity referrals. If 90 days with no movement, reassess |
| Open Design install adds maintenance burden | Treat as personal tool only; don't depend on it in CI |
| Large `/llms-full.txt` may exceed crawler size limits | Split into pages (`-001.txt`, etc.) with an index manifest |
| Spec change in MCP could break installed clients | Version the manifest; old endpoint stays live during transition |
| Schema.org markup over-claims or contradicts visible content | Validator as CI guard; manual spot-check on Google Rich Results Test before each release |
| Adding 12 components over 1 week burns out and ships poor docs | Cap at 7 if quality dips; prefer fewer high-quality components over many sloppy ones |
| Open Design upstream renames a skill or design system; our slug breaks | Sync script preserves a slug-stability table; renames open a PR for human review rather than auto-applying |
| Open Design upstream removes content (e.g., a system owner objects); we still serve stale references | Sync script flags removed entries; we mirror the removal in a follow-up PR. Document SLA: respond to upstream takedowns within 7 days |
| Original system owner (e.g., Linear) objects to our redistribution despite Apache-2.0 | Public takedown process at `/takedown` and `docs/takedown.md`. Honor within 48h. Maintain transparent log |
| Sync conflicts with locally-edited references (we tweaked an entry) | Sync script detects via checksum, skips conflicted entry, logs for manual resolution. Never silently overwrites |
| 72 references + 31 skills explode build time | Astro content collections are designed for this scale; benchmark first build, use selective hydration on browse pages |
| MCP `find_skill_for_scenario` recommendations mislead agents | Tool returns top-3 with rationale, never single-answer. Document that the recommendation is a heuristic |
| Apache-2.0 attribution chain becomes stale (upstream's upstream changes) | Every entry stores `attribution.upstream_sha` — if we audit and find drift, we re-sync. Don't claim deeper provenance than we can verify |
| Vendored content dilutes the personal-craft signal of Originals | Visual differentiation: distinct cards, Reference badges, separate browse pages, Originals-first home featured strip |

---

## 11. Open questions (non-blocking for spec approval)

- **MCP authentication?** None for v2 (public read-only). v3 may add API tokens for write tools (publish, update) if SaaS direction is pursued.
- **Should `/llms.txt` link to the API/MCP/OpenAPI as "Optional"?** Per spec convention, agents skip the Optional section by default. Linking there means an agent reading just the primary section gets the components but not the MCP. **Decision: list MCP and API in the primary section, not Optional.** Discovery > minimalism.
- **Pre-rendered MCP responses for crawlers?** SEO crawlers can't speak MCP. The `/api/*.json` and `/llms-full.txt` cover them. No special handling needed.
- **Brand mark visible on llms.txt?** The format is text-only; the hero `# Djasha System` is the entire branding. Fine.

---

## 12. Appendix A — Standards referenced

| Standard | URL | Used for |
|---|---|---|
| llms.txt | https://llmstxt.org/ | `/llms.txt`, `/llms-full.txt` |
| Schema.org | https://schema.org/ | JSON-LD per page |
| Model Context Protocol | https://modelcontextprotocol.io/ | `/mcp` server |
| OpenAPI 3.1 | https://spec.openapis.org/oas/v3.1.0 | `/openapi.json` |
| Sitemap protocol 0.9 | https://www.sitemaps.org/protocol.html | sitemap-index.xml |
| robots.txt | https://www.robotstxt.org/ | `/robots.txt` |
| ai.txt (emerging) | https://site.spawning.ai/ai-txt | `/ai.txt` |
| Well-known URI registry | RFC 8615 | `/.well-known/mcp` |

---

## 13. Appendix B — Brainstorm decision trail

| Decision point | Chosen | Alternatives considered |
|---|---|---|
| v2 primary product | Library/index only (no SaaS) | Open Design hosted SaaS; integrated funnel both |
| Brand | Stay personal (Djasha System on system.djasha.me) | New product brand; subdomain on personal |
| Authoring tool | Open Design installed locally for personal use | Skip Open Design; keep terminal Claude Code only |
| References strategy (revised mid-brainstorm) | **Vendor Open Design's Apache-2.0 catalog** of 72 design systems + 31 skills + 5 directions. Re-distribute with full attribution. | Hand-curate ~10 famous systems ourselves (rejected: legal + maintenance); skip references entirely (rejected: leaves the agent-discovery moat too thin) |
| Open Design runtime features | NOT vendored — we use their content, not their app | Fork their Next.js stack; embed their daemon; mirror their UI |
| HyperFrames runtime | Deferred | Vendor as-is; build companion |
| MCP server hosting | Vercel serverless function | Cloudflare Worker; self-host on Coolify |
| MCP tool granularity | Per-collection tools (search_components, search_references, list_skills, etc.) + cross-cutting `find_design_system` and `compose_brief` | One mega-search tool; full GraphQL surface |
| Vendoring update cadence | Monthly cron + manual trigger; PR-based, never auto-merge | Daily; weekly; manual only |
| Conflict resolution for vendored entries we edit | Checksum-based skip + manual resolution | Auto-overwrite; auto-merge with conflict markers |
| llms.txt scope | Generated from content collections at build | Hand-edit; static template |

---

**Next step:** invoke `writing-plans` skill once user approves this spec to produce a phased implementation plan.
