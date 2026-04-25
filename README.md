# Djasha System

*An AI-native design system. Copy code, copy prompts, copy the whole bundle into any agent.*

**Live:** https://djasha-system.vercel.app
**Status:** v1 shipped 2026-04-22

## What this is

A standalone static design system library. Not another shadcn clone — the differentiator is **built for AI-agent consumption**. Every component ships a natural-language prompt and a full-context bundle (tokens + source + a11y) that any AI agent (Claude Code, Cursor, v0, Bolt) can paste in one shot to port into a target stack.

## What's in v1

- **8 components** — AnimatedText, CharacterReveal, CustomCursor, MagneticButton, ParallaxImage, ScrollMarquee, StackingCards, TiltCard
- **Public JSON API** at `/api/index.json` — full manifest, no auth, CORS-open
- **AI-native bundles** at `/bundles/<slug>.md` — tokens + source + a11y notes in one paste-ready file
- **Command-K search** powered by Fuse.js across components, props, and prompts
- **Per-component OG images** auto-generated via astro-og-canvas

## Quick start

Browse the library at https://djasha-system.vercel.app.

To consume programmatically:

```bash
# Get the full manifest
curl -s https://djasha-system.vercel.app/api/index.json

# Grab a component's full context bundle
curl -s https://djasha-system.vercel.app/bundles/magnetic-button.md | pbcopy
# then paste into Claude Code / Cursor / v0 / Bolt
```

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run test       # Vitest unit tests
npm run test:e2e   # Playwright smoke tests
npm run build      # Static output in dist/
npm run check:all  # Run all CI guards locally
```

### Adding a component

```bash
# 1. Copy or write the source
cp some-component.tsx src/components/NewThing.tsx

# 2. Scaffold doc + playground + preview stubs
npm run scaffold -- NewThing

# 3. Fill in the scaffolded files
#    - src/content/components/new-thing.doc.mdx (Prompt, Usage, Do/Don't)
#    - src/components/NewThing.playground.tsx (knobs + toCode)
#    - src/components/NewThing.preview.tsx (Demo wrapper)

# 4. Register in the island registries
#    - src/components/chrome/PlaygroundIsland.tsx
#    - src/components/chrome/PreviewIsland.tsx

# 5. Verify + commit
npm run check:all && npm run build
git add -A && git commit -m "feat(components): add NewThing"
```

The CI guards will fail the build if any `src/components/<Name>.tsx` is missing its matching `.doc.mdx`.

## Architecture

Static Astro 6 site with React 19 islands. Content collections are git-only. See [`docs/superpowers/specs/2026-04-20-djasha-system-design.md`](docs/superpowers/specs/2026-04-20-djasha-system-design.md) for the full design.

**Stack:** Astro 6, React 19, Tailwind 3 (PostCSS), TypeScript, Zod (via `astro:content`), Fuse.js, Shiki, astro-og-canvas, Vitest, Playwright.

## Phase 2 path

[`docs/phase-2-notes.md`](docs/phase-2-notes.md) captures the roadmap for a Payload-backed admin with a chat-to-canvas AI editor at `studio.djasha.me`. v1 ships without it.

---

Maintained by [Diaa Asha](https://djasha.me). Source on [GitHub](https://github.com/djasha/system).
