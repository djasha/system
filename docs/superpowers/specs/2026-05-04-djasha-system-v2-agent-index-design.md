# Djasha System v2 — Agent Discovery Index

**Date:** 2026-05-04
**Status:** Approved for implementation planning
**Author:** Diaa Asha (<diaasha7@gmail.com>, <me@djasha.me>)
**Builds on:** [v1 design spec](./2026-04-20-djasha-system-design.md) (shipped 2026-04-22)

---

## 1. Overview

### What this is

A v2 extension of `djasha-system`. Same domain (`system.djasha.me`), same brand, same content-as-git architecture. The library doesn't change shape — the *discoverability* layer does.

The goal: when an AI agent (Claude Code, Cursor, ChatGPT search, Perplexity, Gemini, Codex, etc.) needs a design system reference, this library is the first hit.

### Positioning shift

**v1 said:** *"AI-native design system. Copy code, copy prompts, copy the whole bundle into any agent."*
**v2 says:** *"The design system AI agents reach for first."*

v1 made the bundles agent-consumable. v2 makes the *discovery surface* agent-native: structured indexes (`/llms.txt`, `/llms-full.txt`), schema.org markup, an MCP server, an OpenAPI spec, and crawler-friendly `robots.txt` allowing the major AI bots.

### Audience

Same as v1, with one new entrant elevated to primary:

- **Primary (NEW):** AI agents and AI-search-grade crawlers (Claude Code MCP clients, Cursor MCP clients, ChatGPT search index, Perplexity, Gemini, Bing AI, etc.).
- **Secondary:** designers/devs using AI agents who arrive at the library via agent recommendation.
- **Tertiary:** humans browsing directly (the v1 use case — still important, not deprecated).
- **Quaternary (you):** personal authoring tool, now with an Open Design local install.

### v2 scope

Two work streams, parallel:

1. **Agent-discovery layer** — `/llms.txt`, `/llms-full.txt`, schema.org JSON-LD, MCP server, OpenAPI, robots.txt allow-list, sitemap improvements.
2. **Content depth** — migrate 7–12 more components from the portfolio, seed 3–5 patterns, seed 5–7 voice entries.

Plus a side track: install Open Design locally for personal authoring.

### Explicit non-goals

- ❌ SaaS, billing, accounts, multi-tenant authoring (deferred to a future v3, possibly forever).
- ❌ Hosted Open Design as a public service.
- ❌ References catalog (curated bundles for other companies' systems — legal risk for solo).
- ❌ Brand change. Stays Djasha System on `system.djasha.me`.

### Success bar

A search like *"design system for AI agents"* on Perplexity/ChatGPT search/Bing returns this library in the first 3 results within 90 days of v2 launch. Or: an agent in Claude Code can install the MCP server with one command and answer *"give me a magnetic button using djasha-system tokens"* without any web call.

---

## 2. Architecture additions

v1 architecture is preserved entirely. v2 adds:

| Surface | Type | Location | Purpose |
|---|---|---|---|
| `/llms.txt` | Static text endpoint | `src/pages/llms.txt.ts` | Concise LLM-readable site index per the [llms.txt spec](https://llmstxt.org/) |
| `/llms-full.txt` | Static text endpoint | `src/pages/llms-full.txt.ts` | Full content dump (all components inline) for non-crawling agents |
| Schema.org JSON-LD | Embedded `<script type="application/ld+json">` | `BaseLayout.astro` per-page slot | `WebSite`, `SoftwareSourceCode`, `CreativeWork`, `BreadcrumbList`, `ItemList` — page-type-specific |
| `/.well-known/mcp` | Static JSON | `src/pages/.well-known/mcp.json.ts` | MCP discovery manifest pointing to `/mcp` |
| `/mcp` | HTTP MCP server | Vercel serverless function (TypeScript) | The actual MCP transport endpoint |
| `/openapi.json` | Static JSON | `src/pages/openapi.json.ts` | OpenAPI 3.1 spec for the v1 JSON API |
| `/robots.txt` | Static text | `src/pages/robots.txt.ts` (replaces default) | Explicit allow-list for major AI bots |
| `/ai.txt` | Static text | `src/pages/ai.txt.ts` | Emerging companion to robots.txt for AI-specific rules |
| `/sitemap-images.xml` | Static XML | Astro sitemap config + custom builder | OG images + component preview thumbnails for image search |
| `/.well-known/llm` | Optional discovery alias | redirect to `/llms.txt` | Belt-and-braces — different agents look in different places |

Tech stack additions:

- `@modelcontextprotocol/sdk` (TypeScript) for the MCP server.
- Vercel **serverless function** for `/mcp` (MCP needs a runtime — can't be statically generated). All other v2 endpoints are static like v1.
- No new framework, no client-side library additions.

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

**Why this is the bet:** every static design system has JSON. Nobody (as of 2026-05-04) has a *Model Context Protocol* server. When agents in Claude Code / Cursor / Codex run `/mcp install system.djasha.me/mcp`, the library becomes a **tool the agent calls directly** — no copy/paste, no curl. Eliminates the friction step.

**Tools exposed (initial set):**

| Tool name | Description | Inputs | Output |
|---|---|---|---|
| `search_components` | Fuzzy search across components by name, description, tags, body | `query: string`, `limit?: number` | `{ slug, name, description, category, tags, score }[]` |
| `get_component` | Fetch a full component by slug | `slug: string` | The same object emitted by `/api/components/<slug>.json` |
| `get_bundle` | Fetch the markdown bundle for a component | `slug: string` | Markdown string (the `/bundles/<slug>.md` content) |
| `list_tokens` | List all tokens, optionally filtered by category | `category?: 'color' \| 'type' \| 'space' \| 'radius' \| 'shadow' \| 'motion'` | `{ slug, name, value, description }[]` |
| `get_token` | Fetch one token's full record | `slug: string` (e.g., `color.accent`) | Full token object |
| `list_patterns` | List all patterns | (none) | `{ slug, name, description, components_used }[]` |
| `get_voice` | Fetch a voice entry by topic slug | `slug: string` | `{ topic, description, rules, examples }` |
| `find_by_token` | Find all components/patterns using a given token | `tokenSlug: string` | `{ components: [...], patterns: [...] }` |

**Resource exposure:**
- Each component exposed as a resource at `mcp://system.djasha.me/components/<slug>` returning the bundle markdown.
- The full library exposed as `mcp://system.djasha.me/manifest` returning `/api/index.json`.

**Transport:** HTTP-streaming (Vercel serverless function with `Streamable HTTP` transport from `@modelcontextprotocol/sdk`). Stateless — no auth, no sessions. Public read-only.

**Discovery:** `/.well-known/mcp` returns `{ "endpoint": "https://system.djasha.me/mcp", "name": "Djasha System", "description": "...", "version": "1" }` so AI agents that look in well-known can find it.

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

The agent-discovery layer is necessary but not sufficient — agents rank by content density too. Need more entries.

### 4.1 Components to migrate (~7–12 more)

Sourced from `/Users/Djasha/portfolio-remake/site/src/components/`. Ordered by impact (most distinctive first):

1. `TextMaskReveal` — masked typographic intro
2. `ScrollProgress` — top scroll indicator
3. `HeroGallery` — multi-image hero grid
4. `ToolTicker` — skills/tools horizontal marquee
5. `Expandable` — disclosure animation
6. `Figure` — semantic image with caption
7. `ImageGrid` — masonry/uniform image grid
8. `ProjectCard` — case-study card
9. `MagneticCTA` (composite of MagneticButton in CTA position) — pattern candidate
10. `SectionHeading` — typographic primitive
11. `ProseHeading` — markdoc-driven heading
12. `SubHeading` — supporting heading

Final list picked at implementation kickoff. Target 15–20 total Originals after v2.

### 4.2 Patterns to seed (~3–5)

The spec called for patterns; v1 shipped zero. Patterns compose primitives:

1. **Editorial Hero** — uses `TextMaskReveal` + `MagneticButton` + `HeroGallery`. The "magazine landing" pattern.
2. **Case Study Body** — uses `ProseHeading` + `Figure` + `ImageGrid` + `Expandable`. The long-form work doc pattern.
3. **Filterable Work Grid** — uses `ProjectCard` + filter chrome + Command-K integration.
4. *(optional)* **Process Section** — uses `StackingCards` + `AnimatedText`.
5. *(optional)* **Brand Ribbon** — uses `ScrollMarquee` + `ToolTicker`.

### 4.3 Voice entries to seed (~5–7)

v1 shipped only "Headlines". Add:

1. **Microcopy** — button labels, link text, form hints.
2. **Error messages** — tone, structure, recovery guidance.
3. **CTAs** — calls to action, tested language patterns.
4. **Empty states** — what to say when there's nothing to show.
5. **Onboarding copy** — first-run, welcome, setup.
6. *(optional)* **Loading states** — skeleton labels, spinners, progress copy.
7. *(optional)* **Confirmations** — destructive-action prompts, success toasts.

### 4.4 References (NOT in v2)

The "References" catalog (Linear, Stripe, Vercel, etc.) from the v2 brainstorm is **explicitly deferred**. Solo curator + legal/attribution risk + maintenance cost ≠ worth it for v2. May revisit if/when the platform goes multi-tenant.

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

Minimal v1 UX changes. Only:

- Home page hero adds a subtle "MCP-ready" badge or one-liner so visitors know the agent integration exists.
- Each component detail page adds a small "Use via MCP" link in the meta rail explaining the one-line install.
- A new `/integrations` page briefly documents:
  - MCP server install (one config snippet for Claude Code, Cursor, Codex).
  - OpenAPI spec endpoint.
  - llms.txt / llms-full.txt for agents that don't speak MCP.
  - Bundle markdown copy-paste pattern (links back to existing detail pages).

No new browse pages, no new filters, no nav restructure.

---

## 7. CI guards (additive)

Two new fail-closed checks in `npm run check:all`:

1. **llms.txt validator** — ensures `/llms.txt` parses against the published spec; every link in it must resolve to a 200.
2. **Schema.org validator** — runs JSON-LD on each page through a local validator (using `schema-dts` types + a small custom validator) to catch malformed structured data at build time.

One non-blocking check:

3. **MCP server contract test** — Playwright spec that boots `vercel dev`, hits `/mcp` with a known MCP client, asserts the tool list and one tool call. Skipped on CI if Vercel CLI isn't available; runs in a follow-up `npm run test:mcp` step.

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
- [ ] At least 3 MCP clients (Claude Code, Cursor, Codex) can install and call `search_components` + `get_bundle` end-to-end.
- [ ] OpenAPI spec at `/openapi.json` validates against OpenAPI 3.1.
- [ ] `robots.txt` + `ai.txt` live; major AI bots not blocked.
- [ ] Library size ≥ 15 components, ≥ 3 patterns, ≥ 5 voice entries.

Discovery (90-day post-launch):

- [ ] Indexed by Google Search Console with all pages submitted.
- [ ] Surfaces in Perplexity / ChatGPT search / Bing AI when querying "design system for AI agents", "MCP design system", "AI-native component library", or similar.
- [ ] Top-3 result for `"djasha system"` brand search across major engines.

Authoring:

- [ ] Open Design installed locally, one component authored end-to-end through it as a proof of loop.

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
| Publishers | Originals only (your work) | Curated References catalog; community publishing |
| Brand | Stay personal (Djasha System on system.djasha.me) | New product brand; subdomain on personal |
| Authoring tool | Open Design installed locally for personal use | Skip Open Design; keep terminal Claude Code only |
| Reference catalog (others' systems) | Deferred indefinitely | Add ~10 famous systems with Djasha-format bundles |
| MCP server hosting | Vercel serverless function | Cloudflare Worker; self-host on Coolify |
| llms.txt scope | Generated from content collections at build | Hand-edit; static template |

---

**Next step:** invoke `writing-plans` skill once user approves this spec to produce a phased implementation plan.
