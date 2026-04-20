# Djasha System v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build v1 of Djasha System — a static AI-native design system library at `system.djasha.me` that lets visitors browse, search, filter, and copy tokens/components/patterns/voice, with live playgrounds and a tabbed copy surface (Preview / Code / Prompt / Bundle).

**Architecture:** Astro 6 static site with React 19 islands, git-only content via Astro content collections (loader-based API), Zod v4-validated frontmatter, build-time Shiki + Fuse.js + OG images, static JSON API emitted at build, CI-enforced doc coverage + reference integrity. No runtime server.

**Tech Stack:** Astro 6, React 19, Tailwind (PostCSS), TypeScript, Zod v4 (via `astro:content`), Shiki, Fuse.js, astro-og-canvas, `@fontsource-variable/*`, Vitest (unit), Playwright (smoke), GitHub Actions, Coolify (deploy).

> **Note on Astro 6 content collections:** Astro 6 removed the legacy `type: 'content'` / `type: 'data'` shorthand. All collections now require an explicit `loader`. The plan's schemas (Task 1.1) use `glob()` from `astro/loaders`. See Task 1.1 for the corrected shape.

**Source spec:** `docs/superpowers/specs/2026-04-20-djasha-system-design.md`

---

## File structure

Created across all phases. Each file has one clear responsibility:

```
djasha-system/
├── astro.config.mjs                             # Astro config
├── tailwind.config.cjs                          # Tailwind tokens mapped from CSS vars
├── postcss.config.cjs                           # PostCSS pipeline
├── tsconfig.json
├── package.json
├── .github/workflows/ci.yml                     # CI pipeline
├── .env.example
├── scripts/
│   ├── check-doc-coverage.ts                    # CI guard 1
│   ├── check-reference-integrity.ts             # CI guard 2
│   ├── generate-bundles.ts                      # build-time bundle .md emit
│   ├── generate-search-index.ts                 # build-time Fuse index emit
│   └── scaffold-component.ts                    # dev helper: new component skeleton
├── src/
│   ├── content.config.ts                        # Astro content collections + Zod schemas
│   ├── content/
│   │   ├── components/                          # <slug>.doc.mdx per component
│   │   ├── patterns/
│   │   ├── tokens/                              # <slug>.yaml per token
│   │   └── voice/
│   ├── components/                              # Source components + helpers
│   │   ├── chrome/                              # Site UI chrome (nav, tabs, sidebar)
│   │   │   ├── Tabs.tsx
│   │   │   ├── CopyButton.tsx
│   │   │   ├── CommandK.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── QuickLaunchRow.tsx
│   │   ├── playground/
│   │   │   ├── Playground.tsx                   # Shared playground shell
│   │   │   └── knobs/                           # Knob primitives (Color, Range, Select)
│   │   ├── MagneticButton.tsx                   # First system component (vertical slice)
│   │   ├── MagneticButton.playground.tsx
│   │   └── MagneticButton.preview.tsx
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── DocLayout.astro                      # Used by all doc detail pages
│   ├── lib/
│   │   ├── bundle.ts                            # Bundle markdown composition
│   │   ├── tokens.ts                            # Token reference resolution
│   │   ├── source-reader.ts                     # Read source files at build + Shiki highlight
│   │   ├── og.ts                                # OG image generator wrapper
│   │   └── types.ts                             # Shared TS types
│   ├── pages/
│   │   ├── index.astro                          # Landing
│   │   ├── about.astro
│   │   ├── components/
│   │   │   ├── index.astro                      # Browse grid
│   │   │   └── [slug].astro                     # Detail page (core UX)
│   │   ├── patterns/{index,[slug]}.astro
│   │   ├── tokens/index.astro
│   │   ├── voice/index.astro
│   │   ├── api/
│   │   │   ├── index.astro                      # API docs page
│   │   │   ├── index.json.ts                    # /api/index.json
│   │   │   ├── components/[slug].json.ts
│   │   │   └── patterns/[slug].json.ts
│   │   ├── bundles/[slug].md.ts                 # /bundles/<slug>.md
│   │   ├── tokens.json.ts                       # /tokens.json
│   │   └── search-index.json.ts                 # /search-index.json
│   └── styles/
│       ├── global.css                           # Reset + base
│       └── tokens.css                           # CSS custom properties
└── tests/
    ├── unit/
    │   ├── bundle.test.ts
    │   ├── tokens.test.ts
    │   ├── check-doc-coverage.test.ts
    │   └── check-reference-integrity.test.ts
    └── e2e/
        └── smoke.spec.ts
```

---

## Phase 0 — Repo bootstrap

### Task 0.1: Initialize Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`

- [ ] **Step 1: Scaffold Astro with TypeScript strict**

```bash
cd /Users/Djasha/djasha-system
npm create astro@latest -- --template minimal --typescript strict --no-git --yes .
```

Expected: files scaffolded, no prompts. Overwrite README conflict if prompted with "y".

- [ ] **Step 2: Add React, MDX, Sitemap integrations**

```bash
npx astro add react mdx sitemap --yes
```

Expected: `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, `react`, `react-dom`, `@types/react`, `@types/react-dom` installed; `astro.config.mjs` updated.

- [ ] **Step 3: Pin `output: 'static'` in astro.config.mjs**

Edit `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://system.djasha.me',
  output: 'static',
  integrations: [react(), mdx(), sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
});
```

- [ ] **Step 4: Verify build works**

```bash
npm run build
```

Expected: `dist/` created with `index.html`, no errors.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore(bootstrap): init Astro 5 with React + MDX"
```

### Task 0.2: Add Tailwind via PostCSS (not @astrojs/tailwind)

**Files:**
- Create: `postcss.config.cjs`, `tailwind.config.cjs`, `src/styles/global.css`, `src/styles/tokens.css`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Install deps (pinned to Tailwind 3)**

```bash
npm install -D tailwindcss@^3 postcss autoprefixer
```

> Pinned to Tailwind 3.x because the config shape and `@tailwind` directives below assume the v3 API. Tailwind 4 uses CSS-first config (`@theme`, `@import "tailwindcss"`) and is a future upgrade path, not a v1 migration.

- [ ] **Step 2: Create `postcss.config.cjs`**

```js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 3: Create `tailwind.config.cjs`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0606',
        bone: '#F5F1EC',
        accent: '#E8462C',
        elevated: '#1A1210',
      },
      fontFamily: {
        sans: ['Geist Variable', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk Variable', 'Geist Variable', 'sans-serif'],
        mono: ['Geist Mono Variable', 'ui-monospace', 'monospace'],
      },
      maxWidth: { content: '840px' },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Create `src/styles/tokens.css` with CSS custom properties**

```css
:root {
  --color-ink: #0A0606;
  --color-bone: #F5F1EC;
  --color-accent: #E8462C;
  --color-elevated: #1A1210;
  --motion-ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --motion-duration-base: 300ms;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}

[data-theme='light'] {
  --color-ink: #F5F1EC;
  --color-bone: #0A0606;
  --color-elevated: #FFFFFF;
}
```

- [ ] **Step 5: Create `src/styles/global.css`**

```css
@import './tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { background: var(--color-ink); color: var(--color-bone); -webkit-font-smoothing: antialiased; }
  body { font-family: 'Geist Variable', system-ui, sans-serif; min-height: 100vh; }
  ::selection { background: rgba(232, 70, 44, 0.28); color: var(--color-bone); }
  :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; border-radius: 2px; }
}
```

- [ ] **Step 6: Import global.css in a shared layout**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
interface Props { title: string; description?: string; }
const { title, description = 'An AI-native design system.' } = Astro.props;
---
<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — Djasha System</title>
    <meta name="description" content={description} />
  </head>
  <body><slot /></body>
</html>
```

Update `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Home">
  <main class="max-w-content mx-auto px-6 py-16">
    <h1 class="font-display text-5xl tracking-tight">Djasha System</h1>
    <p class="text-bone/70 mt-4">An AI-native design system.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 7: Verify + commit**

```bash
npm run build && git add . && git commit -m "feat(styles): add Tailwind via PostCSS + tokens.css"
```

Expected: build succeeds; `dist/index.html` contains rendered Tailwind classes.

### Task 0.3: Add fonts

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/styles/fonts.css`

- [ ] **Step 1: Install fontsource variable packages**

```bash
npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource-variable/geist-mono
```

- [ ] **Step 2: Create `src/styles/fonts.css`**

```css
@import '@fontsource-variable/geist';
@import '@fontsource-variable/space-grotesk';
@import '@fontsource-variable/geist-mono';
```

- [ ] **Step 3: Import in global.css**

Prepend to `src/styles/global.css`:

```css
@import './fonts.css';
```

- [ ] **Step 4: Build + commit**

```bash
npm run build && git add . && git commit -m "feat(fonts): add Geist + Space Grotesk + Geist Mono"
```

### Task 0.4: Install utility dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
npm install fuse.js clsx
```

- [ ] **Step 2: Install build-time deps (incl. Astro's type-checker + TypeScript)**

```bash
npm install -D @astrojs/check typescript vitest @types/node shiki gray-matter astro-og-canvas canvaskit-wasm glob js-yaml @types/js-yaml
```

> `@astrojs/check` + `typescript` are required for `npx astro check`. Astro 6 no longer bundles them and will prompt interactively for install without them — which hangs CI. `js-yaml` is used by the reference-integrity script in Task 2.2.

- [ ] **Step 3: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "chore(deps): add Fuse.js, Vitest, Shiki, Playwright, astro-og-canvas, @astrojs/check"
```

---

## Phase 1 — Content schemas

### Task 1.1: Define Zod schemas for all four collections

**Files:**
- Create: `src/content.config.ts`, `src/lib/types.ts`

- [ ] **Step 1: Create `src/lib/types.ts` (shared enums)**

```ts
export const CATEGORIES = ['input', 'display', 'navigation', 'layout', 'motion', 'overlay', 'feedback'] as const;
export type Category = typeof CATEGORIES[number];

export const STATUSES = ['stable', 'beta', 'experimental'] as const;
export type Status = typeof STATUSES[number];

export const TOKEN_CATEGORIES = ['color', 'type', 'space', 'radius', 'shadow', 'motion'] as const;
export type TokenCategory = typeof TOKEN_CATEGORIES[number];
```

- [ ] **Step 2: Create `src/content.config.ts` (Astro 6 loader API)**

> Astro 6 removed the legacy `type: 'content'`/`type: 'data'` shorthand. All collections now require an explicit `loader`. We use `glob()` from `astro/loaders` and `generateId` to produce clean slugs from `<slug>.doc.mdx` files.

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES, STATUSES, TOKEN_CATEGORIES } from './lib/types';

const componentSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  description: z.string(),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()).default([]),
  tokens_used: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  status: z.enum(STATUSES).default('experimental'),
  source_path: z.string(),
  a11y_notes: z.string(),
  created: z.coerce.date(),
});

const components = defineCollection({
  loader: glob({
    pattern: '**/*.doc.mdx',
    base: './src/content/components',
    generateId: ({ entry }) => entry.replace(/\.doc\.mdx$/, ''),
  }),
  schema: componentSchema,
});

const patterns = defineCollection({
  loader: glob({
    pattern: '**/*.doc.mdx',
    base: './src/content/patterns',
    generateId: ({ entry }) => entry.replace(/\.doc\.mdx$/, ''),
  }),
  schema: componentSchema.extend({
    components_used: z.array(z.string()).default([]),
  }),
});

const tokens = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/tokens',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    category: z.enum(TOKEN_CATEGORIES),
    value: z.string(),
    tailwind_class: z.string().optional(),
    css_var: z.string(),
    description: z.string(),
  }),
});

const voice = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/voice',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: z.object({
    topic: z.string(),
    description: z.string(),
    rules: z.array(z.string()),
    examples: z.array(z.object({ good: z.string(), bad: z.string() })).default([]),
  }),
});

export const collections = { components, patterns, tokens, voice };
```

> **Note on entry ids throughout the rest of the plan:** Because `generateId` strips the `.doc.mdx` / `.yaml` suffix, `entry.id` is already the clean slug (`magnetic-button`, not `magnetic-button.doc.mdx`). Later tasks that call `.replace(/\.doc\.mdx$/, '')` on `entry.id` are defensive no-ops and can be left as-is, OR simplified to just use `entry.id` directly — both produce the same value.

- [ ] **Step 3: Verify Astro picks up schemas**

```bash
npx astro check
```

Expected: no errors (collections are empty — no schema violations yet).

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/lib/types.ts
git commit -m "feat(content): define Zod schemas for all collections"
```

### Task 1.2: Seed tokens collection

**Files:**
- Create: `src/content/tokens/color-accent.yaml` (and 9 others)

- [ ] **Step 1: Create `src/content/tokens/color-accent.yaml`**

```yaml
name: accent
category: color
value: '#E8462C'
tailwind_class: text-accent / bg-accent
css_var: '--color-accent'
description: Primary accent color. Use sparingly for focal points, CTAs, focus rings, and selection.
```

- [ ] **Step 2: Create 9 more token files**

Create the following files (same structure, vary the fields):

- `src/content/tokens/color-ink.yaml` — name: `ink`, value: `#0A0606`, css_var: `--color-ink`, desc: "Background / foreground in dark theme. The deep neutral."
- `src/content/tokens/color-bone.yaml` — name: `bone`, value: `#F5F1EC`, css_var: `--color-bone`, desc: "Body text on dark. Background in light theme."
- `src/content/tokens/color-elevated.yaml` — name: `elevated`, value: `#1A1210`, css_var: `--color-elevated`, desc: "Elevated surfaces — cards, tabs, modals."
- `src/content/tokens/motion-ease-out-quart.yaml` — name: `ease-out-quart`, category: `motion`, value: `cubic-bezier(0.165, 0.84, 0.44, 1)`, css_var: `--motion-ease-out-quart`, desc: "Default easing for outgoing motion."
- `src/content/tokens/motion-duration-base.yaml` — name: `duration-base`, category: `motion`, value: `300ms`, css_var: `--motion-duration-base`, desc: "Base animation duration."
- `src/content/tokens/space-1.yaml` — name: `1`, category: `space`, value: `0.25rem`, css_var: `--space-1`, desc: "Smallest spacing unit."
- `src/content/tokens/space-4.yaml` — name: `4`, category: `space`, value: `1rem`, css_var: `--space-4`, desc: "Default body-copy spacing."
- `src/content/tokens/space-8.yaml` — name: `8`, category: `space`, value: `2rem`, css_var: `--space-8`, desc: "Section-gap spacing."
- `src/content/tokens/radius-md.yaml` — name: `md`, category: `radius`, value: `8px`, css_var: `--radius-md`, desc: "Default border-radius."

- [ ] **Step 3: Verify schemas accept the data**

```bash
npx astro check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/content/tokens/
git commit -m "feat(content): seed 10 base tokens (color, motion, space, radius)"
```

### Task 1.3: Seed one placeholder component doc

Purpose: give the CI guards something non-empty to run against in Phase 2. This doc will be replaced in Phase 3.

**Files:**
- Create: `src/components/Placeholder.tsx`, `src/content/components/placeholder.doc.mdx`

- [ ] **Step 1: Create `src/components/Placeholder.tsx`**

```tsx
export function Placeholder() {
  return <div className="text-accent">placeholder</div>;
}
```

- [ ] **Step 2: Create `src/content/components/placeholder.doc.mdx`**

```mdx
---
name: Placeholder
description: Placeholder component used to wire up CI before the first real component lands.
category: display
tags: [internal]
tokens_used: [color.accent]
related: []
status: experimental
source_path: src/components/Placeholder.tsx
a11y_notes: No a11y concerns — static text.
created: 2026-04-20
---

## Prompt

Placeholder component. Replaced during first real component migration.

## Usage

Do not use in production. Internal only.

## Do / Don't

- **Don't** ship this to users.
- **Do** delete this entry once the first real component lands.
```

- [ ] **Step 3: Verify schemas + build**

```bash
npx astro check && npm run build
```

Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add src/components/Placeholder.tsx src/content/components/placeholder.doc.mdx
git commit -m "feat(content): seed placeholder component for CI wiring"
```

---

## Phase 2 — CI guards (keep docs up to date — before any more content)

### Task 2.1: Doc-coverage check (TDD)

**Files:**
- Create: `scripts/check-doc-coverage.ts`, `tests/unit/check-doc-coverage.test.ts`

- [ ] **Step 1: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], globals: true },
});
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 2: Write failing tests first**

Create `tests/unit/check-doc-coverage.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { findMissingDocs } from '../../scripts/check-doc-coverage';

describe('findMissingDocs', () => {
  it('returns empty when every component has a doc', () => {
    const components = ['MagneticButton', 'TiltCard'];
    const docs = ['magnetic-button', 'tilt-card'];
    expect(findMissingDocs(components, docs)).toEqual([]);
  });

  it('returns the slugified names of components missing docs', () => {
    const components = ['MagneticButton', 'TiltCard', 'NewThing'];
    const docs = ['magnetic-button'];
    expect(findMissingDocs(components, docs).sort()).toEqual(['new-thing', 'tilt-card']);
  });

  it('excludes .playground and .preview helper files', () => {
    // The caller filters before calling, but ensure the function is tolerant.
    const components = ['MagneticButton'];
    const docs = ['magnetic-button'];
    expect(findMissingDocs(components, docs)).toEqual([]);
  });
});
```

- [ ] **Step 3: Run — verify it fails**

```bash
npm run test
```

Expected: FAIL ("Cannot find module ../../scripts/check-doc-coverage").

- [ ] **Step 4: Implement**

Create `scripts/check-doc-coverage.ts`:

```ts
import { globSync } from 'glob';
import path from 'node:path';

export function slugify(componentName: string): string {
  return componentName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function findMissingDocs(componentNames: string[], docSlugs: string[]): string[] {
  const docSet = new Set(docSlugs);
  return componentNames
    .map(slugify)
    .filter((slug) => !docSet.has(slug))
    .sort();
}

export async function run(): Promise<number> {
  const sourceFiles = globSync('src/components/*.{tsx,astro}', { cwd: process.cwd() })
    .filter((f) => !/\.(playground|preview)\.(tsx|astro)$/.test(f));
  const componentNames = sourceFiles.map((f) => path.basename(f).replace(/\.(tsx|astro)$/, ''));

  const docFiles = globSync('src/content/components/*.doc.mdx', { cwd: process.cwd() });
  const docSlugs = docFiles.map((f) => path.basename(f).replace(/\.doc\.mdx$/, ''));

  const missing = findMissingDocs(componentNames, docSlugs);
  if (missing.length > 0) {
    console.error(`\nDoc-coverage check FAILED. ${missing.length} component(s) missing docs:\n`);
    missing.forEach((slug) => console.error(`  - src/content/components/${slug}.doc.mdx`));
    console.error('\nCreate the missing .doc.mdx files or remove the orphan source files.\n');
    return 1;
  }
  console.log(`Doc-coverage OK — ${componentNames.length} components, all documented.`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().then((code) => process.exit(code));
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npm run test
```

Expected: PASS (3 tests).

- [ ] **Step 6: Run the actual script end-to-end**

```bash
npx tsx scripts/check-doc-coverage.ts
```

Expected: "Doc-coverage OK — 1 components, all documented." (the Placeholder).

- [ ] **Step 7: Commit**

```bash
git add scripts/check-doc-coverage.ts tests/unit/check-doc-coverage.test.ts vitest.config.ts package.json
git commit -m "feat(ci): doc-coverage check + tests"
```

### Task 2.2: Reference-integrity check (TDD)

**Files:**
- Create: `scripts/check-reference-integrity.ts`, `tests/unit/check-reference-integrity.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/check-reference-integrity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { findOrphanReferences } from '../../scripts/check-reference-integrity';

describe('findOrphanReferences', () => {
  const knownTokens = new Set(['color.accent', 'color.ink', 'motion.ease-out-quart']);
  const knownComponents = new Set(['magnetic-button', 'tilt-card']);

  it('returns empty when all references resolve', () => {
    const entries = [
      { file: 'a.mdx', tokens_used: ['color.accent'], related: ['tilt-card'], components_used: [] },
    ];
    expect(findOrphanReferences(entries, knownTokens, knownComponents)).toEqual([]);
  });

  it('flags orphan tokens with file + missing slug', () => {
    const entries = [
      { file: 'a.mdx', tokens_used: ['color.missing'], related: [], components_used: [] },
    ];
    expect(findOrphanReferences(entries, knownTokens, knownComponents)).toEqual([
      { file: 'a.mdx', field: 'tokens_used', slug: 'color.missing' },
    ]);
  });

  it('flags orphan related components', () => {
    const entries = [
      { file: 'b.mdx', tokens_used: [], related: ['nonexistent'], components_used: [] },
    ];
    expect(findOrphanReferences(entries, knownTokens, knownComponents)).toEqual([
      { file: 'b.mdx', field: 'related', slug: 'nonexistent' },
    ]);
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

Expected: FAIL (module missing).

- [ ] **Step 3: Implement**

Create `scripts/check-reference-integrity.ts`:

```ts
import { globSync } from 'glob';
import matter from 'gray-matter';
import fs from 'node:fs';
import yaml from 'node:util';

export interface Entry {
  file: string;
  tokens_used: string[];
  related: string[];
  components_used: string[];
}

export interface Orphan {
  file: string;
  field: 'tokens_used' | 'related' | 'components_used';
  slug: string;
}

export function findOrphanReferences(
  entries: Entry[],
  knownTokens: Set<string>,
  knownComponents: Set<string>,
): Orphan[] {
  const orphans: Orphan[] = [];
  for (const e of entries) {
    for (const t of e.tokens_used) if (!knownTokens.has(t)) orphans.push({ file: e.file, field: 'tokens_used', slug: t });
    for (const r of e.related) if (!knownComponents.has(r)) orphans.push({ file: e.file, field: 'related', slug: r });
    for (const c of e.components_used) if (!knownComponents.has(c)) orphans.push({ file: e.file, field: 'components_used', slug: c });
  }
  return orphans;
}

export async function run(): Promise<number> {
  const tokenFiles = globSync('src/content/tokens/*.yaml');
  const knownTokens = new Set(
    tokenFiles.map((f) => {
      const parsed = require('js-yaml').load(fs.readFileSync(f, 'utf8')) as { category: string; name: string };
      return `${parsed.category}.${parsed.name}`;
    }),
  );

  const componentDocs = globSync('src/content/components/*.doc.mdx');
  const patternDocs = globSync('src/content/patterns/*.doc.mdx');
  const knownComponents = new Set(componentDocs.map((f) => f.split('/').pop()!.replace('.doc.mdx', '')));

  const entries: Entry[] = [...componentDocs, ...patternDocs].map((file) => {
    const { data } = matter(fs.readFileSync(file, 'utf8'));
    return {
      file,
      tokens_used: data.tokens_used ?? [],
      related: data.related ?? [],
      components_used: data.components_used ?? [],
    };
  });

  const orphans = findOrphanReferences(entries, knownTokens, knownComponents);
  if (orphans.length > 0) {
    console.error(`\nReference-integrity check FAILED. ${orphans.length} orphan reference(s):\n`);
    orphans.forEach((o) => console.error(`  - ${o.file}: ${o.field}[] references unknown "${o.slug}"`));
    return 1;
  }
  console.log(`Reference-integrity OK — ${entries.length} entries checked.`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().then((code) => process.exit(code));
}
```

- [ ] **Step 4: Install js-yaml**

```bash
npm install js-yaml && npm install -D @types/js-yaml
```

- [ ] **Step 5: Run tests**

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 6: Run the script on actual content**

```bash
npx tsx scripts/check-reference-integrity.ts
```

Expected: "Reference-integrity OK — 1 entries checked."

- [ ] **Step 7: Commit**

```bash
git add scripts/check-reference-integrity.ts tests/unit/check-reference-integrity.test.ts package.json
git commit -m "feat(ci): reference-integrity check + tests"
```

### Task 2.3: Wire checks into npm scripts + GitHub Actions

**Files:**
- Modify: `package.json`
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Add scripts to `package.json`**

```json
{
  "scripts": {
    "check:docs": "tsx scripts/check-doc-coverage.ts",
    "check:refs": "tsx scripts/check-reference-integrity.ts",
    "check:all": "npm run check:docs && npm run check:refs && astro check",
    "lint": "astro check",
    "test": "vitest run",
    "build": "npm run check:all && astro build"
  }
}
```

- [ ] **Step 2: Install tsx**

```bash
npm install -D tsx
```

- [ ] **Step 3: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run check:all
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```

- [ ] **Step 4: Verify locally**

```bash
npm run check:all && npm run build
```

Expected: all checks pass, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/ci.yml
git commit -m "feat(ci): wire checks into build + GitHub Actions"
```

### Task 2.4: Bonus stale-doc warn script

Per spec §5: flag when a component source changed recently but its doc didn't. Non-blocking.

**Files:**
- Create: `scripts/warn-stale-docs.ts`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Implement**

```ts
import { execSync } from 'node:child_process';
import { globSync } from 'glob';
import path from 'node:path';

function lastCommitTimestamp(file: string): number {
  try {
    const out = execSync(`git log -1 --format=%ct -- "${file}"`, { encoding: 'utf8' }).trim();
    return out ? Number(out) * 1000 : 0;
  } catch { return 0; }
}

function slugify(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const WINDOW_DAYS = 30;
const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;

const sources = globSync('src/components/*.{tsx,astro}').filter((f) => !/\.(playground|preview)\.tsx$/.test(f));
const warnings: string[] = [];

for (const src of sources) {
  const name = path.basename(src).replace(/\.(tsx|astro)$/, '');
  const slug = slugify(name);
  const docPath = `src/content/components/${slug}.doc.mdx`;
  const srcTime = lastCommitTimestamp(src);
  const docTime = lastCommitTimestamp(docPath);
  if (srcTime > cutoff && srcTime > docTime) {
    warnings.push(`  - ${name}: source updated ${new Date(srcTime).toISOString().split('T')[0]}, doc last updated ${docTime ? new Date(docTime).toISOString().split('T')[0] : 'never'}`);
  }
}

if (warnings.length) {
  console.warn(`\nStale-doc warnings (${WINDOW_DAYS}-day window):\n${warnings.join('\n')}\n`);
  console.warn('These do NOT block merge — update docs when convenient.\n');
} else {
  console.log(`Stale-doc check OK — no components have drifted.`);
}
// Exit 0 always — non-blocking.
```

- [ ] **Step 2: Add to CI workflow (non-blocking step)**

In `.github/workflows/ci.yml`, add before the `build` step:

```yaml
      - run: npx tsx scripts/warn-stale-docs.ts
        continue-on-error: true
```

- [ ] **Step 3: Commit**

```bash
git add scripts/warn-stale-docs.ts .github/workflows/ci.yml
git commit -m "feat(ci): non-blocking stale-doc warnings (30-day window)"
```

---

## Phase 3 — First component end-to-end (vertical slice)

### Task 3.1: Build bundle generator (TDD)

**Files:**
- Create: `src/lib/bundle.ts`, `tests/unit/bundle.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/bundle.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { composeBundle } from '../../src/lib/bundle';

describe('composeBundle', () => {
  const input = {
    name: 'MagneticButton',
    description: 'Button with cursor-proximity magnetic pull.',
    promptBody: 'Create a button that pulls toward the cursor when hovered within 100px.',
    usageBody: 'Use for primary CTAs where subtle motion draws attention.',
    tokens: [{ slug: 'color.accent', value: '#E8462C' }],
    a11yNotes: 'Respects prefers-reduced-motion.',
    sourcePath: 'src/components/MagneticButton.tsx',
    sourceCode: 'export function MagneticButton() { return null; }',
    sourceLanguage: 'tsx',
  };

  it('includes the component name as H1', () => {
    expect(composeBundle(input)).toMatch(/^# MagneticButton\n/);
  });

  it('includes description below the name', () => {
    expect(composeBundle(input)).toContain('Button with cursor-proximity magnetic pull.');
  });

  it('includes the prompt under ## Prompt', () => {
    const bundle = composeBundle(input);
    expect(bundle).toContain('## Prompt');
    expect(bundle).toContain('Create a button that pulls toward the cursor');
  });

  it('includes resolved tokens with values', () => {
    expect(composeBundle(input)).toMatch(/## Tokens[\s\S]*color\.accent[\s\S]*#E8462C/);
  });

  it('includes source in a fenced code block tagged with language', () => {
    expect(composeBundle(input)).toMatch(/```tsx\nexport function MagneticButton\(\) \{ return null; \}\n```/);
  });

  it('includes a11y notes', () => {
    expect(composeBundle(input)).toContain('prefers-reduced-motion');
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

Expected: FAIL (module missing).

- [ ] **Step 3: Implement**

Create `src/lib/bundle.ts`:

```ts
export interface BundleInput {
  name: string;
  description: string;
  promptBody: string;
  usageBody: string;
  tokens: Array<{ slug: string; value: string }>;
  a11yNotes: string;
  sourcePath: string;
  sourceCode: string;
  sourceLanguage: string;
}

export function composeBundle(i: BundleInput): string {
  const tokenLines = i.tokens.map((t) => `- \`${t.slug}\` — \`${t.value}\``).join('\n');
  return `# ${i.name}

${i.description}

## Prompt

${i.promptBody.trim()}

## Tokens

${tokenLines || '_(none)_'}

## A11y

${i.a11yNotes.trim()}

## Source (\`${i.sourcePath}\`)

\`\`\`${i.sourceLanguage}
${i.sourceCode.trimEnd()}
\`\`\`

## Usage

${i.usageBody.trim()}
`;
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/bundle.ts tests/unit/bundle.test.ts
git commit -m "feat(lib): bundle composer with full TDD coverage"
```

### Task 3.2: Build token resolver (TDD)

**Files:**
- Create: `src/lib/tokens.ts`, `tests/unit/tokens.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveTokens } from '../../src/lib/tokens';

const known = new Map([
  ['color.accent', { slug: 'color.accent', name: 'accent', category: 'color', value: '#E8462C' }],
  ['motion.duration-base', { slug: 'motion.duration-base', name: 'duration-base', category: 'motion', value: '300ms' }],
]);

describe('resolveTokens', () => {
  it('resolves each slug to its full record', () => {
    const result = resolveTokens(['color.accent'], known);
    expect(result).toEqual([{ slug: 'color.accent', name: 'accent', category: 'color', value: '#E8462C' }]);
  });

  it('throws on unknown slug', () => {
    expect(() => resolveTokens(['color.missing'], known)).toThrow(/color\.missing/);
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

- [ ] **Step 3: Implement**

Create `src/lib/tokens.ts`:

```ts
export interface Token {
  slug: string;
  name: string;
  category: string;
  value: string;
  tailwind_class?: string;
  css_var?: string;
  description?: string;
}

export function resolveTokens(slugs: string[], known: Map<string, Token>): Token[] {
  return slugs.map((slug) => {
    const token = known.get(slug);
    if (!token) throw new Error(`Unknown token reference: "${slug}"`);
    return token;
  });
}
```

- [ ] **Step 4: Run + commit**

```bash
npm run test
git add src/lib/tokens.ts tests/unit/tokens.test.ts
git commit -m "feat(lib): token resolver + tests"
```

### Task 3.3: Source reader (file contents + Shiki highlight)

**Files:**
- Create: `src/lib/source-reader.ts`

- [ ] **Step 1: Implement**

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { codeToHtml } from 'shiki';

export async function readSource(relPath: string): Promise<string> {
  const abs = path.resolve(process.cwd(), relPath);
  return fs.readFile(abs, 'utf8');
}

export function languageFromPath(relPath: string): string {
  const ext = path.extname(relPath).slice(1);
  return { tsx: 'tsx', jsx: 'jsx', ts: 'ts', js: 'js', astro: 'astro', css: 'css', md: 'md' }[ext] ?? 'text';
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  return codeToHtml(code, { lang, theme: 'github-dark-dimmed' });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/source-reader.ts
git commit -m "feat(lib): source reader + Shiki highlighting"
```

### Task 3.4: Port MagneticButton from portfolio as the first real component

**Files:**
- Create: `src/components/MagneticButton.tsx`

Reference source: `/Users/Djasha/portfolio-remake/site/src/components/MagneticButton.tsx` (copy content, adjust imports to match new project structure).

- [ ] **Step 1: Copy the source file**

```bash
cp /Users/Djasha/portfolio-remake/site/src/components/MagneticButton.tsx /Users/Djasha/djasha-system/src/components/MagneticButton.tsx
```

- [ ] **Step 2: Open the file and remove any portfolio-specific imports**

Inspect `src/components/MagneticButton.tsx`. Remove imports referencing `@/` aliases or `astro:*` that don't exist in the new repo. Replace any token usage with CSS custom properties (`var(--color-accent)` etc.) if not already.

- [ ] **Step 3: Add a Props interface if the source doesn't have one**

The component must accept typed props (accent color, pull strength, duration) so the playground can control it:

```tsx
export interface MagneticButtonProps {
  children: React.ReactNode;
  accent?: string;
  pullStrength?: number;
  durationMs?: number;
  onClick?: () => void;
}
```

(Preserve existing implementation; just wrap/extend it to accept these optional props.)

- [ ] **Step 4: Build + verify**

```bash
npm run build
```

Expected: success (component compiles; unused warning tolerable since no page imports it yet).

- [ ] **Step 5: Commit**

```bash
git add src/components/MagneticButton.tsx
git commit -m "feat(components): port MagneticButton from portfolio as first DS component"
```

### Task 3.5: Create MagneticButton's doc, playground, and preview

**Files:**
- Create: `src/content/components/magnetic-button.doc.mdx`, `src/components/MagneticButton.playground.tsx`, `src/components/MagneticButton.preview.tsx`
- Delete: `src/content/components/placeholder.doc.mdx`, `src/components/Placeholder.tsx`

- [ ] **Step 1: Create `src/content/components/magnetic-button.doc.mdx`**

```mdx
---
name: MagneticButton
description: Button with cursor-proximity magnetic pull for subtle attention in primary CTAs.
category: input
tags: [motion, button, interactive]
tokens_used: [color.accent, motion.ease-out-quart, motion.duration-base, space.4]
related: []
status: stable
source_path: src/components/MagneticButton.tsx
a11y_notes: Respects prefers-reduced-motion — pull effect disables. Focus ring uses outline (no transform). Keyboard-activatable via Space/Enter.
created: 2026-04-20
---

## Prompt

Build a button component that applies a subtle translation toward the cursor when the cursor enters a 100px radius around it. Use a configurable pull strength (0–1, default 0.3) and eased duration (default 300ms, ease-out-quart). On mouseleave, the button springs back to center. Respect `prefers-reduced-motion` — disable the pull effect entirely. Primary color accent for focus ring and hover state.

## Usage

- Use for primary CTAs where subtle motion draws the eye without shouting.
- **Not** for forms, modal buttons, or anywhere users expect clicks at pixel-precise positions.
- Do not stack multiple MagneticButtons in close proximity — they'll compete for cursor attention.

## Do / Don't

- **Do** pair with `color.accent` for focal CTAs.
- **Do** respect reduced-motion preferences.
- **Don't** use for destructive actions — motion suggests playfulness.
- **Don't** nest inside scrolling containers — pull calculation gets weird.
```

- [ ] **Step 2: Create `src/components/MagneticButton.playground.tsx`**

```tsx
export const knobs = [
  { name: 'accent', type: 'color', default: '#E8462C' },
  { name: 'pullStrength', type: 'range', min: 0, max: 1, step: 0.05, default: 0.3 },
  { name: 'durationMs', type: 'range', min: 100, max: 1200, step: 50, default: 300, unit: 'ms' },
  { name: 'label', type: 'text', default: 'Get in touch' },
] as const;

export type KnobValues = {
  accent: string;
  pullStrength: number;
  durationMs: number;
  label: string;
};

export function toCode(v: KnobValues): string {
  return `<MagneticButton
  accent="${v.accent}"
  pullStrength={${v.pullStrength}}
  durationMs={${v.durationMs}}
>
  ${v.label}
</MagneticButton>`;
}
```

- [ ] **Step 3: Create `src/components/MagneticButton.preview.tsx`**

```tsx
import { MagneticButton } from './MagneticButton';

export default function Demo(props: Partial<React.ComponentProps<typeof MagneticButton>>) {
  return (
    <div className="flex items-center justify-center min-h-[240px]">
      <MagneticButton {...props}>{props.children ?? 'Get in touch'}</MagneticButton>
    </div>
  );
}
```

- [ ] **Step 4: Remove the placeholder**

```bash
rm src/components/Placeholder.tsx src/content/components/placeholder.doc.mdx
```

- [ ] **Step 5: Run checks + build**

```bash
npm run check:all && npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(components): full doc + playground + preview for MagneticButton, drop placeholder"
```

### Task 3.6: Build `/bundles/[slug].md.ts` endpoint

**Files:**
- Create: `src/pages/bundles/[slug].md.ts`

- [ ] **Step 1: Implement**

```ts
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import matter from 'gray-matter';
import fs from 'node:fs/promises';
import path from 'node:path';
import { composeBundle } from '../../lib/bundle';
import { languageFromPath, readSource } from '../../lib/source-reader';

export const getStaticPaths: GetStaticPaths = async () => {
  const components = await getCollection('components');
  const patterns = await getCollection('patterns');
  return [...components, ...patterns].map((entry) => ({
    params: { slug: entry.id.replace(/\.doc\.mdx$/, '') },
    props: { entry },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as Awaited<ReturnType<typeof getEntry>> & { body: string; data: any };

  const raw = await fs.readFile(path.resolve(process.cwd(), `src/content/components/${entry.id}`), 'utf8');
  const { content: body } = matter(raw);

  const promptBody = extractSection(body, 'Prompt');
  const usageBody = extractSection(body, 'Usage');

  const tokenCollection = await getCollection('tokens');
  const tokenMap = new Map(tokenCollection.map((t) => [`${t.data.category}.${t.data.name}`, t.data]));
  const tokens = entry.data.tokens_used.map((slug: string) => {
    const t = tokenMap.get(slug);
    return { slug, value: t?.value ?? '(unresolved)' };
  });

  const sourceCode = await readSource(entry.data.source_path);
  const sourceLanguage = languageFromPath(entry.data.source_path);

  const bundle = composeBundle({
    name: entry.data.name,
    description: entry.data.description,
    promptBody,
    usageBody,
    tokens,
    a11yNotes: entry.data.a11y_notes,
    sourcePath: entry.data.source_path,
    sourceCode,
    sourceLanguage,
  });

  return new Response(bundle, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};

function extractSection(body: string, heading: string): string {
  const pattern = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
  return body.match(pattern)?.[1].trim() ?? '';
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: `dist/bundles/magnetic-button.md` exists.

- [ ] **Step 3: Spot-check the output**

```bash
cat dist/bundles/magnetic-button.md | head -30
```

Expected: starts with `# MagneticButton`, has Prompt / Tokens / Source sections.

- [ ] **Step 4: Commit**

```bash
git add src/pages/bundles/[slug].md.ts
git commit -m "feat(api): generate /bundles/<slug>.md at build time"
```

### Task 3.7: Build chrome components (Tabs, CopyButton)

**Files:**
- Create: `src/components/chrome/Tabs.tsx`, `src/components/chrome/CopyButton.tsx`

- [ ] **Step 1: Implement `CopyButton.tsx`**

```tsx
import { useState } from 'react';
import clsx from 'clsx';

export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'px-3 py-1.5 text-xs font-mono rounded-md border border-bone/15 bg-elevated hover:border-accent/60 transition-colors',
        className,
      )}
      aria-live="polite"
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
```

- [ ] **Step 2: Implement `Tabs.tsx`**

```tsx
import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

export interface Tab { id: string; label: string; content: ReactNode; }

export function Tabs({ tabs, initial = 0 }: { tabs: Tab[]; initial?: number }) {
  const [active, setActive] = useState(initial);
  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-bone/10">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={clsx(
              'px-4 py-2 text-sm font-mono border-b-2 -mb-px transition-colors',
              i === active ? 'border-accent text-bone' : 'border-transparent text-bone/60 hover:text-bone',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="py-6">{tabs[active].content}</div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/chrome/Tabs.tsx src/components/chrome/CopyButton.tsx
git commit -m "feat(chrome): Tabs + CopyButton primitives"
```

### Task 3.8: Build Playground shell + knob primitives

**Files:**
- Create: `src/components/playground/Playground.tsx`, `src/components/playground/knobs/{Color,Range,Text,Select}.tsx`

- [ ] **Step 1: Create knob primitives**

`src/components/playground/knobs/Color.tsx`:

```tsx
export function ColorKnob({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 py-2">
      <span className="text-xs font-mono text-bone/70">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 border-0 bg-transparent cursor-pointer" />
    </label>
  );
}
```

`src/components/playground/knobs/Range.tsx`:

```tsx
export function RangeKnob({
  label, value, min, max, step, unit = '', onChange,
}: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label className="py-2 block">
      <div className="flex justify-between text-xs font-mono text-bone/70">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-accent" />
    </label>
  );
}
```

`src/components/playground/knobs/Text.tsx`:

```tsx
export function TextKnob({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="py-2 block">
      <span className="text-xs font-mono text-bone/70 block mb-1">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-elevated border border-bone/10 rounded-md px-2 py-1 text-sm" />
    </label>
  );
}
```

- [ ] **Step 2: Create `Playground.tsx`**

```tsx
import { useState, type ComponentType } from 'react';
import { ColorKnob } from './knobs/Color';
import { RangeKnob } from './knobs/Range';
import { TextKnob } from './knobs/Text';
import { CopyButton } from '../chrome/CopyButton';

export interface KnobSpec {
  name: string;
  type: 'color' | 'range' | 'text';
  default: any;
  min?: number; max?: number; step?: number; unit?: string;
}

export function Playground<Values extends Record<string, any>>({
  Demo,
  knobs,
  toCode,
}: {
  Demo: ComponentType<Partial<Values>>;
  knobs: readonly KnobSpec[];
  toCode: (values: Values) => string;
}) {
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(knobs.map((k) => [k.name, k.default])) as Values,
  );
  const [bg, setBg] = useState<'dark' | 'light' | 'grid'>('dark');
  const bgClass = { dark: 'bg-ink', light: 'bg-bone text-ink', grid: 'bg-[repeating-linear-gradient(45deg,_transparent_0_8px,_rgba(255,255,255,0.04)_8px_16px)]' }[bg];

  const set = <K extends keyof Values>(k: K, v: Values[K]) => setValues((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-6 border border-bone/10 rounded-lg overflow-hidden">
      <div className={`min-h-[320px] flex items-center justify-center ${bgClass}`}>
        <Demo {...values} />
      </div>
      <aside className="p-4 bg-elevated/50 border-l border-bone/10">
        <div className="flex gap-1 mb-4 text-xs font-mono">
          {(['dark', 'light', 'grid'] as const).map((b) => (
            <button key={b} onClick={() => setBg(b)} className={`px-2 py-1 rounded ${bg === b ? 'bg-accent text-ink' : 'bg-bone/5 text-bone/70'}`}>{b}</button>
          ))}
        </div>
        {knobs.map((k) => {
          if (k.type === 'color') return <ColorKnob key={k.name} label={k.name} value={values[k.name]} onChange={(v) => set(k.name as any, v as any)} />;
          if (k.type === 'range') return <RangeKnob key={k.name} label={k.name} value={values[k.name]} min={k.min!} max={k.max!} step={k.step!} unit={k.unit} onChange={(v) => set(k.name as any, v as any)} />;
          if (k.type === 'text') return <TextKnob key={k.name} label={k.name} value={values[k.name]} onChange={(v) => set(k.name as any, v as any)} />;
          return null;
        })}
        <div className="mt-4 pt-4 border-t border-bone/10">
          <CopyButton text={toCode(values)} label="Copy tweaked code" />
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/playground/
git commit -m "feat(playground): shell + knobs + copy-tweaked-code"
```

### Task 3.9: Component detail page `/components/[slug]`

**Files:**
- Create: `src/layouts/DocLayout.astro`, `src/pages/components/[slug].astro`, `src/components/chrome/QuickLaunchRow.tsx`, `src/components/chrome/MetaRail.astro`

- [ ] **Step 1: Create `DocLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
interface Props { title: string; description?: string; }
const { title, description } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <main class="max-w-content mx-auto px-6 py-16">
    <slot />
  </main>
</BaseLayout>
```

- [ ] **Step 2: Create `QuickLaunchRow.tsx`**

```tsx
import { CopyButton } from './CopyButton';

export function QuickLaunchRow({ bundleUrl, bundleText }: { bundleUrl: string; bundleText: string }) {
  const v0 = `https://v0.dev/chat?q=${encodeURIComponent(bundleText)}`;
  const bolt = `https://bolt.new/?prompt=${encodeURIComponent(bundleText)}`;
  return (
    <div className="flex flex-wrap gap-2">
      <a href={v0} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-mono border border-bone/15 rounded-md hover:border-accent/60">Open in v0</a>
      <a href={bolt} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-mono border border-bone/15 rounded-md hover:border-accent/60">Open in Bolt</a>
      <CopyButton text={bundleText} label="Copy for Claude Code / Cursor" />
      <a href={bundleUrl} className="px-3 py-1.5 text-xs font-mono border border-bone/15 rounded-md hover:border-accent/60" download>Download .md</a>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/pages/components/[slug].astro`**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
import { Tabs } from '../../components/chrome/Tabs';
import { CopyButton } from '../../components/chrome/CopyButton';
import { Playground } from '../../components/playground/Playground';
import { QuickLaunchRow } from '../../components/chrome/QuickLaunchRow';
import { composeBundle } from '../../lib/bundle';
import { readSource, languageFromPath, highlightCode } from '../../lib/source-reader';
import matter from 'gray-matter';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function getStaticPaths() {
  const components = await getCollection('components');
  return components.map((entry) => ({ params: { slug: entry.id.replace(/\.doc\.mdx$/, '') }, props: { entry } }));
}

const { entry } = Astro.props;

// Read + parse body prose
const raw = await fs.readFile(path.resolve(`src/content/components/${entry.id}`), 'utf8');
const { content: body } = matter(raw);
const extract = (h: string) => body.match(new RegExp(`##\\s+${h}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i'))?.[1].trim() ?? '';
const promptBody = extract('Prompt');
const usageBody = extract('Usage');
const doDontBody = extract("Do / Don't");

// Tokens
const tokenCollection = await getCollection('tokens');
const tokenMap = new Map(tokenCollection.map((t) => [`${t.data.category}.${t.data.name}`, t.data]));
const tokens = entry.data.tokens_used.map((slug: string) => ({ slug, value: tokenMap.get(slug)?.value ?? '(unresolved)' }));

// Source
const sourceCode = await readSource(entry.data.source_path);
const sourceLang = languageFromPath(entry.data.source_path);
const sourceHtml = await highlightCode(sourceCode, sourceLang);

// Bundle
const bundle = composeBundle({
  name: entry.data.name, description: entry.data.description,
  promptBody, usageBody, tokens,
  a11yNotes: entry.data.a11y_notes,
  sourcePath: entry.data.source_path, sourceCode, sourceLanguage: sourceLang,
});

// Lazy-load playground + demo — written as dynamic imports in the island
const slug = entry.id.replace(/\.doc\.mdx$/, '');
---
<DocLayout title={entry.data.name} description={entry.data.description}>
  <header class="mb-8">
    <h1 class="font-display text-4xl tracking-tight">{entry.data.name}</h1>
    <p class="text-bone/70 mt-2">{entry.data.description}</p>
    <div class="mt-3 flex gap-2 text-xs font-mono text-bone/50">
      <span class="px-2 py-0.5 border border-bone/15 rounded">{entry.data.status}</span>
      {entry.data.tags.map((t: string) => <span class="px-2 py-0.5 border border-bone/15 rounded">#{t}</span>)}
    </div>
  </header>

  <section class="mb-10">
    <h2 class="sr-only">Live playground</h2>
    <PlaygroundIsland client:load slug={slug} />
  </section>

  <Tabs client:idle tabs={[
    { id: 'preview', label: 'Preview', content: <PreviewIsland client:idle slug={slug} /> },
    { id: 'code', label: 'Code', content: <div set:html={sourceHtml} /> },
    { id: 'prompt', label: 'Prompt', content: <PromptPanel promptBody={promptBody} /> },
    { id: 'bundle', label: 'Bundle', content: <BundlePanel bundle={bundle} slug={slug} /> },
  ]} />

  <aside class="mt-10 grid md:grid-cols-[1fr_280px] gap-8">
    <section>
      <h2 class="font-display text-xl">Usage</h2>
      <div class="prose prose-invert mt-3" set:html={usageBody} />
      <h2 class="font-display text-xl mt-8">Do / Don't</h2>
      <div class="prose prose-invert mt-3" set:html={doDontBody} />
    </section>
    <aside class="text-sm text-bone/70 space-y-4">
      <div>
        <h3 class="font-mono text-xs uppercase tracking-wide text-bone/50 mb-1">Tokens</h3>
        <ul class="space-y-1">
          {tokens.map((t) => <li><a href={`/tokens#${t.slug}`} class="hover:text-accent font-mono text-xs">{t.slug}</a></li>)}
        </ul>
      </div>
      <div>
        <h3 class="font-mono text-xs uppercase tracking-wide text-bone/50 mb-1">A11y</h3>
        <p class="text-xs">{entry.data.a11y_notes}</p>
      </div>
      <div>
        <h3 class="font-mono text-xs uppercase tracking-wide text-bone/50 mb-1">Source</h3>
        <a href={`https://github.com/djasha/system/blob/main/${entry.data.source_path}`} class="hover:text-accent font-mono text-xs">{entry.data.source_path}</a>
      </div>
    </aside>
  </aside>
</DocLayout>
```

> Note: `PlaygroundIsland`, `PreviewIsland`, `PromptPanel`, `BundlePanel` are written as small React components in Task 3.10 below.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/DocLayout.astro src/pages/components/[slug].astro src/components/chrome/QuickLaunchRow.tsx
git commit -m "feat(pages): component detail page scaffold"
```

### Task 3.10: Wire up islands (PlaygroundIsland, PreviewIsland, prompt+bundle panels)

**Files:**
- Create: `src/components/chrome/PlaygroundIsland.tsx`, `src/components/chrome/PreviewIsland.tsx`, `src/components/chrome/PromptPanel.tsx`, `src/components/chrome/BundlePanel.tsx`

- [ ] **Step 1: Create `PlaygroundIsland.tsx`**

```tsx
import { lazy, Suspense } from 'react';
import { Playground } from '../playground/Playground';

// A registry keyed by slug; each entry dynamically imports the playground config + preview.
const registry: Record<string, { loadConfig: () => Promise<any>; loadDemo: () => Promise<any> }> = {
  'magnetic-button': {
    loadConfig: () => import('../MagneticButton.playground'),
    loadDemo: () => import('../MagneticButton.preview'),
  },
};

export function PlaygroundIsland({ slug }: { slug: string }) {
  const entry = registry[slug];
  if (!entry) return <div className="text-bone/50">No playground for "{slug}".</div>;
  const Demo = lazy(entry.loadDemo);
  const [ConfigPromise] = [entry.loadConfig()];

  return (
    <Suspense fallback={<div className="text-bone/40">Loading playground…</div>}>
      <PlaygroundAsync ConfigPromise={ConfigPromise} Demo={Demo} />
    </Suspense>
  );
}

function PlaygroundAsync({ ConfigPromise, Demo }: any) {
  const config = React.use(ConfigPromise);
  return <Playground Demo={Demo.default ?? Demo} knobs={config.knobs} toCode={config.toCode} />;
}

import React from 'react';
```

- [ ] **Step 2: Create `PreviewIsland.tsx`**

```tsx
import { lazy, Suspense } from 'react';

const registry: Record<string, () => Promise<any>> = {
  'magnetic-button': () => import('../MagneticButton.preview'),
};

export function PreviewIsland({ slug }: { slug: string }) {
  const loader = registry[slug];
  if (!loader) return <div className="text-bone/50">No preview for "{slug}".</div>;
  const Demo = lazy(loader);
  return (
    <Suspense fallback={<div className="text-bone/40">Loading preview…</div>}>
      <div className="min-h-[320px] flex items-center justify-center border border-bone/10 rounded-lg bg-elevated/40">
        <Demo />
      </div>
    </Suspense>
  );
}
```

- [ ] **Step 3: Create `PromptPanel.tsx` and `BundlePanel.tsx`**

```tsx
// PromptPanel.tsx
import { CopyButton } from './CopyButton';
export function PromptPanel({ promptBody }: { promptBody: string }) {
  return (
    <div>
      <pre className="whitespace-pre-wrap font-mono text-sm bg-elevated p-4 rounded-md border border-bone/10">{promptBody}</pre>
      <div className="mt-3 flex gap-2 items-center">
        <CopyButton text={promptBody} label="Copy prompt" />
        <span className="text-xs text-bone/50">Paste into any AI agent.</span>
      </div>
    </div>
  );
}
```

```tsx
// BundlePanel.tsx
import { CopyButton } from './CopyButton';
import { QuickLaunchRow } from './QuickLaunchRow';
export function BundlePanel({ bundle, slug }: { bundle: string; slug: string }) {
  return (
    <div>
      <pre className="whitespace-pre-wrap font-mono text-xs bg-elevated p-4 rounded-md border border-bone/10 max-h-[360px] overflow-auto">{bundle}</pre>
      <div className="mt-3 space-y-3">
        <QuickLaunchRow bundleUrl={`/bundles/${slug}.md`} bundleText={bundle} />
        <p className="text-xs text-bone/50">Paste into Claude Code, Cursor, v0, or Bolt to port this into your stack.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update `[slug].astro` imports + register the islands**

Add to the frontmatter of `src/pages/components/[slug].astro`:

```astro
import { PlaygroundIsland } from '../../components/chrome/PlaygroundIsland';
import { PreviewIsland } from '../../components/chrome/PreviewIsland';
import { PromptPanel } from '../../components/chrome/PromptPanel';
import { BundlePanel } from '../../components/chrome/BundlePanel';
```

- [ ] **Step 5: Build + smoke-test**

```bash
npm run build && npm run preview &
sleep 2 && curl -s http://localhost:4321/components/magnetic-button | head -50
```

Expected: HTML with "MagneticButton" as title + tabs markup.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(pages): wire Playground + Preview + Prompt + Bundle islands into detail page"
```

---

## Phase 4 — Browse + search

### Task 4.1: Build `/components` grid page

**Files:**
- Create: `src/pages/components/index.astro`, `src/components/chrome/ComponentCard.astro`

- [ ] **Step 1: Create `ComponentCard.astro`**

```astro
---
interface Props { slug: string; name: string; description: string; category: string; tags: string[]; }
const { slug, name, description, category, tags } = Astro.props;
---
<a href={`/components/${slug}`} class="block p-5 border border-bone/10 rounded-lg bg-elevated/40 hover:border-accent/60 transition-colors">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-display text-lg">{name}</h3>
    <span class="text-xs font-mono text-bone/50 uppercase">{category}</span>
  </div>
  <p class="text-sm text-bone/70 mb-3">{description}</p>
  <div class="flex flex-wrap gap-1">
    {tags.map((t) => <span class="text-xs font-mono text-bone/50">#{t}</span>)}
  </div>
</a>
```

- [ ] **Step 2: Create `src/pages/components/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
import ComponentCard from '../../components/chrome/ComponentCard.astro';

const components = await getCollection('components');
---
<DocLayout title="Components" description="Browse the full component library.">
  <h1 class="font-display text-4xl mb-2">Components</h1>
  <p class="text-bone/70 mb-8">{components.length} components. Copy code, prompts, or full bundles.</p>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {components.map((c) => (
      <ComponentCard
        slug={c.id.replace(/\.doc\.mdx$/, '')}
        name={c.data.name}
        description={c.data.description}
        category={c.data.category}
        tags={c.data.tags}
      />
    ))}
  </div>
</DocLayout>
```

- [ ] **Step 3: Build + spot-check**

```bash
npm run build
```

Expected: `dist/components/index.html` exists with "MagneticButton" linked.

- [ ] **Step 4: Commit**

```bash
git add src/pages/components/index.astro src/components/chrome/ComponentCard.astro
git commit -m "feat(pages): components grid page"
```

### Task 4.2: Build-time search index

**Files:**
- Create: `src/pages/search-index.json.ts`

- [ ] **Step 1: Implement**

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const [components, patterns, tokens, voice] = await Promise.all([
    getCollection('components'),
    getCollection('patterns'),
    getCollection('tokens'),
    getCollection('voice'),
  ]);

  const entries = [
    ...components.map((c) => ({
      type: 'component',
      slug: c.id.replace(/\.doc\.mdx$/, ''),
      name: c.data.name,
      description: c.data.description,
      tags: c.data.tags,
      category: c.data.category,
      body: c.body ?? '',
    })),
    ...patterns.map((p) => ({
      type: 'pattern',
      slug: p.id.replace(/\.doc\.mdx$/, ''),
      name: p.data.name,
      description: p.data.description,
      tags: p.data.tags,
      category: p.data.category,
      body: p.body ?? '',
    })),
    ...tokens.map((t) => ({
      type: 'token',
      slug: `${t.data.category}.${t.data.name}`,
      name: t.data.name,
      description: t.data.description,
      category: t.data.category,
    })),
    ...voice.map((v) => ({
      type: 'voice',
      slug: v.id,
      name: v.data.topic,
      description: v.data.description,
    })),
  ];

  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } });
};
```

- [ ] **Step 2: Build + verify**

```bash
npm run build && cat dist/search-index.json | head -c 500
```

Expected: JSON array including MagneticButton and 10 tokens.

- [ ] **Step 3: Commit**

```bash
git add src/pages/search-index.json.ts
git commit -m "feat(api): emit /search-index.json at build"
```

### Task 4.3: Command-K search island

**Files:**
- Create: `src/components/chrome/CommandK.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';

interface Entry { type: string; slug: string; name: string; description?: string; category?: string; tags?: string[]; body?: string; }

export function CommandK() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    fetch('/search-index.json').then((r) => r.json()).then(setEntries);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fuse = useMemo(() => new Fuse(entries, { keys: ['name', 'description', 'tags', 'body'], threshold: 0.3 }), [entries]);
  const results = q ? fuse.search(q).slice(0, 20).map((r) => r.item) : entries.slice(0, 20);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-start justify-center pt-32" onClick={() => setOpen(false)}>
      <div className="bg-elevated border border-bone/15 rounded-lg w-full max-w-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search components, tokens, patterns…" className="w-full bg-transparent px-4 py-3 font-mono text-sm border-b border-bone/10 outline-none" />
        <ul className="max-h-[60vh] overflow-auto">
          {results.map((r) => (
            <li key={`${r.type}-${r.slug}`}>
              <a href={linkFor(r)} className="flex items-baseline justify-between px-4 py-2 hover:bg-accent/10 font-mono text-sm">
                <span>{r.name}</span>
                <span className="text-bone/50 text-xs">{r.type}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function linkFor(r: Entry): string {
  if (r.type === 'component') return `/components/${r.slug}`;
  if (r.type === 'pattern') return `/patterns/${r.slug}`;
  if (r.type === 'token') return `/tokens#${r.slug}`;
  return '/voice';
}
```

- [ ] **Step 2: Mount in `BaseLayout.astro`**

Edit `src/layouts/BaseLayout.astro` body:

```astro
<body>
  <slot />
  <CommandK client:idle />
</body>
```

Add import at top: `import { CommandK } from '../components/chrome/CommandK';`

- [ ] **Step 3: Build + manual smoke (local preview)**

```bash
npm run build && npm run preview &
```

Open http://localhost:4321 and hit Cmd-K — modal should appear and filter as you type.

- [ ] **Step 4: Commit**

```bash
git add src/components/chrome/CommandK.tsx src/layouts/BaseLayout.astro
git commit -m "feat(chrome): Command-K global search via Fuse.js"
```

### Task 4.4: Sidebar filters on `/components`

**Files:**
- Create: `src/components/chrome/ComponentFilters.tsx`
- Modify: `src/pages/components/index.astro`

- [ ] **Step 1: Implement filter island**

`src/components/chrome/ComponentFilters.tsx`:

```tsx
import { useMemo, useState } from 'react';
import clsx from 'clsx';

interface Item { slug: string; name: string; description: string; category: string; tags: string[]; tokens_used: string[]; }

export function ComponentFilters({ items }: { items: Item[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [tokens, setTokens] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => [...new Set(items.flatMap((i) => i.tags))].sort(), [items]);
  const allTokens = useMemo(() => [...new Set(items.flatMap((i) => i.tokens_used))].sort(), [items]);
  const allCategories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items]);

  const filtered = items.filter((i) =>
    (!category || i.category === category) &&
    (tags.size === 0 || [...tags].every((t) => i.tags.includes(t))) &&
    (tokens.size === 0 || [...tokens].every((t) => i.tokens_used.includes(t))),
  );

  const toggle = (set: Set<string>, val: string, setFn: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setFn(next);
  };

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-6 text-sm">
        <Group title="Category">
          <button onClick={() => setCategory(null)} className={clsx('block text-left w-full py-1', !category && 'text-accent')}>All</button>
          {allCategories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={clsx('block text-left w-full py-1', category === c && 'text-accent')}>{c}</button>
          ))}
        </Group>
        <Group title="Tags">
          {allTags.map((t) => (
            <label key={t} className="flex gap-2 py-1 cursor-pointer">
              <input type="checkbox" checked={tags.has(t)} onChange={() => toggle(tags, t, setTags)} />
              <span>{t}</span>
            </label>
          ))}
        </Group>
        <Group title="Uses token">
          {allTokens.map((t) => (
            <label key={t} className="flex gap-2 py-1 cursor-pointer font-mono text-xs">
              <input type="checkbox" checked={tokens.has(t)} onChange={() => toggle(tokens, t, setTokens)} />
              <span>{t}</span>
            </label>
          ))}
        </Group>
      </aside>
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((i) => (
          <a key={i.slug} href={`/components/${i.slug}`} className="block p-4 border border-bone/10 rounded-lg hover:border-accent/60">
            <h3 className="font-display">{i.name}</h3>
            <p className="text-sm text-bone/70 mt-1">{i.description}</p>
          </a>
        ))}
        {filtered.length === 0 && <p className="text-bone/50">No components match these filters.</p>}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-mono text-xs uppercase tracking-wide text-bone/50 mb-2">{title}</h4>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Swap grid for filter island in `src/pages/components/index.astro`**

Replace the `<div class="grid…">…</div>` with:

```astro
<ComponentFilters client:idle items={components.map((c) => ({
  slug: c.id.replace(/\.doc\.mdx$/, ''),
  name: c.data.name,
  description: c.data.description,
  category: c.data.category,
  tags: c.data.tags,
  tokens_used: c.data.tokens_used,
}))} />
```

Add the import at top.

- [ ] **Step 3: Delete now-unused `ComponentCard.astro`**

Task 4.1 created `src/components/chrome/ComponentCard.astro`, but `ComponentFilters.tsx` renders cards inline. Delete the unused file:

```bash
rm src/components/chrome/ComponentCard.astro
```

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add -A
git commit -m "feat(browse): sidebar filters (category, tags, tokens), drop unused ComponentCard"
```

---

## Phase 5 — Remaining collections

### Task 5.1: Tokens page

**Files:**
- Create: `src/pages/tokens/index.astro`

- [ ] **Step 1: Implement**

```astro
---
import { getCollection } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
const tokens = await getCollection('tokens');
const byCategory = tokens.reduce((acc, t) => {
  (acc[t.data.category] ??= []).push(t);
  return acc;
}, {} as Record<string, typeof tokens>);
---
<DocLayout title="Tokens" description="Design tokens — colors, space, motion, radius, shadow, type.">
  <h1 class="font-display text-4xl mb-2">Tokens</h1>
  <p class="text-bone/70 mb-8">{tokens.length} tokens, grouped by category.</p>
  {Object.entries(byCategory).map(([cat, items]) => (
    <section class="mb-10">
      <h2 class="font-display text-2xl mb-4 capitalize">{cat}</h2>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((t) => (
          <div id={`${cat}.${t.data.name}`} class="p-4 border border-bone/10 rounded-lg bg-elevated/40">
            <div class="flex items-center gap-3 mb-2">
              {cat === 'color' && <span class="w-6 h-6 rounded border border-bone/15" style={`background:${t.data.value}`} />}
              <span class="font-mono text-sm">{cat}.{t.data.name}</span>
            </div>
            <div class="font-mono text-xs text-bone/70">{t.data.value}</div>
            <p class="text-xs text-bone/60 mt-2">{t.data.description}</p>
            {t.data.tailwind_class && <div class="font-mono text-xs text-accent mt-2">{t.data.tailwind_class}</div>}
          </div>
        ))}
      </div>
    </section>
  ))}
</DocLayout>
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/tokens/index.astro
git commit -m "feat(pages): tokens index grouped by category"
```

### Task 5.2: Patterns page + detail (stub for v1)

**Files:**
- Create: `src/pages/patterns/index.astro`, `src/pages/patterns/[slug].astro`

- [ ] **Step 1: Implement `index.astro` (copies `/components/index.astro` pattern, filters `patterns` collection)**

Reuse the filter shape from Task 4.4; swap collection name to `patterns`. Empty state expected in v1 (no patterns seeded yet).

```astro
---
import { getCollection } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
const patterns = await getCollection('patterns');
---
<DocLayout title="Patterns">
  <h1 class="font-display text-4xl mb-2">Patterns</h1>
  {patterns.length === 0 ? (
    <p class="text-bone/50">No patterns yet. Patterns compose multiple components into higher-order primitives like "editorial hero" or "case-study body."</p>
  ) : (
    <div class="grid sm:grid-cols-2 gap-4">
      {patterns.map((p) => (
        <a href={`/patterns/${p.id.replace(/\.doc\.mdx$/, '')}`} class="block p-4 border border-bone/10 rounded-lg">
          <h3 class="font-display">{p.data.name}</h3>
          <p class="text-sm text-bone/70 mt-1">{p.data.description}</p>
        </a>
      ))}
    </div>
  )}
</DocLayout>
```

- [ ] **Step 2: Create `[slug].astro`** (mirrors `components/[slug].astro`; reuse Tabs + Playground + meta rail — identical structure, collection name swapped to `patterns`).

Since the shape is identical, copy `src/pages/components/[slug].astro` to `src/pages/patterns/[slug].astro` and swap:
- `getCollection('components')` → `getCollection('patterns')`
- `src/content/components/` → `src/content/patterns/`
- Registry slugs in `PlaygroundIsland`/`PreviewIsland` — leave empty for now (no pattern implementations in v1).

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/pages/patterns/
git commit -m "feat(pages): patterns index + detail (empty set in v1)"
```

### Task 5.3: Voice page

**Files:**
- Create: `src/pages/voice/index.astro`, `src/content/voice/headlines.yaml` (seed)

- [ ] **Step 1: Seed one voice entry**

`src/content/voice/headlines.yaml`:

```yaml
topic: Headlines
description: How to write headings that carry weight without shouting.
rules:
  - Write in sentence case, not title case.
  - Prefer nouns and verbs over adjectives. Remove the first adjective; if the headline still works, remove it.
  - Keep under 10 words. If you need more words, you need a subhead instead.
examples:
  - good: A design system built for AI agents.
    bad: The incredibly powerful, AI-native, next-generation design system of the future.
  - good: Ship faster. Ship with taste.
    bad: We're proud to announce our groundbreaking new initiative.
```

- [ ] **Step 2: Implement page**

```astro
---
import { getCollection } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
const voice = await getCollection('voice');
---
<DocLayout title="Voice">
  <h1 class="font-display text-4xl mb-2">Voice</h1>
  <p class="text-bone/70 mb-8">How the system sounds when it talks.</p>
  {voice.map((v) => (
    <section class="mb-12">
      <h2 class="font-display text-2xl mb-2">{v.data.topic}</h2>
      <p class="text-bone/70 mb-4">{v.data.description}</p>
      <ul class="list-disc pl-5 space-y-1 text-bone/80">
        {v.data.rules.map((r: string) => <li>{r}</li>)}
      </ul>
      {v.data.examples.length > 0 && (
        <div class="grid sm:grid-cols-2 gap-3 mt-4">
          {v.data.examples.map((e: any) => (
            <div class="p-4 border border-bone/10 rounded-lg">
              <p class="text-xs font-mono text-accent mb-1">Good</p>
              <p class="mb-3">{e.good}</p>
              <p class="text-xs font-mono text-bone/40 mb-1">Bad</p>
              <p class="text-bone/60 line-through">{e.bad}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  ))}
</DocLayout>
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/pages/voice/ src/content/voice/
git commit -m "feat(pages): voice page + seed 'headlines' entry"
```

---

## Phase 6 — JSON API endpoints

### Task 6.1: `/api/index.json`

**Files:**
- Create: `src/pages/api/index.json.ts`

- [ ] **Step 1: Implement**

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const [components, patterns, tokens, voice] = await Promise.all([
    getCollection('components'), getCollection('patterns'), getCollection('tokens'), getCollection('voice'),
  ]);

  const manifest = {
    components: components.map((c) => ({
      slug: c.id.replace(/\.doc\.mdx$/, ''),
      name: c.data.name,
      description: c.data.description,
      category: c.data.category,
      tags: c.data.tags,
      status: c.data.status,
    })),
    patterns: patterns.map((p) => ({
      slug: p.id.replace(/\.doc\.mdx$/, ''),
      name: p.data.name, description: p.data.description, category: p.data.category, tags: p.data.tags, status: p.data.status,
    })),
    tokens: tokens.map((t) => ({ slug: `${t.data.category}.${t.data.name}`, value: t.data.value, category: t.data.category, description: t.data.description })),
    voice: voice.map((v) => ({ slug: v.id, topic: v.data.topic, description: v.data.description })),
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/index.json.ts
git commit -m "feat(api): /api/index.json manifest"
```

### Task 6.2: `/api/components/[slug].json` + `/api/patterns/[slug].json`

**Files:**
- Create: `src/pages/api/components/[slug].json.ts`, `src/pages/api/patterns/[slug].json.ts`

- [ ] **Step 1: Implement `components/[slug].json.ts`**

```ts
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import matter from 'gray-matter';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readSource, languageFromPath } from '../../../lib/source-reader';

export const getStaticPaths: GetStaticPaths = async () => {
  const components = await getCollection('components');
  return components.map((entry) => ({ params: { slug: entry.id.replace(/\.doc\.mdx$/, '') }, props: { entry } }));
};

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as any;
  const raw = await fs.readFile(path.resolve(`src/content/components/${entry.id}`), 'utf8');
  const { content: body } = matter(raw);
  const extract = (h: string) => body.match(new RegExp(`##\\s+${h}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i'))?.[1].trim() ?? '';

  const tokens = await getCollection('tokens');
  const tokenMap = new Map(tokens.map((t) => [`${t.data.category}.${t.data.name}`, t.data]));
  const resolvedTokens = entry.data.tokens_used.map((slug: string) => ({ slug, ...(tokenMap.get(slug) ?? { value: '(unresolved)' }) }));

  const relatedCollection = await getCollection('components');
  const relatedMap = new Map(relatedCollection.map((c) => [c.id.replace(/\.doc\.mdx$/, ''), c.data]));
  const resolvedRelated = entry.data.related.map((slug: string) => ({ slug, ...(relatedMap.get(slug) ?? {}) }));

  const sourceCode = await readSource(entry.data.source_path);
  const sourceLanguage = languageFromPath(entry.data.source_path);

  return new Response(JSON.stringify({
    slug: entry.id.replace(/\.doc\.mdx$/, ''),
    ...entry.data,
    prompt: extract('Prompt'),
    usage: extract('Usage'),
    do_dont: extract("Do / Don't"),
    tokens_resolved: resolvedTokens,
    related_resolved: resolvedRelated,
    source: { path: entry.data.source_path, language: sourceLanguage, code: sourceCode },
  }, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
```

- [ ] **Step 2: Copy to `patterns/[slug].json.ts`**, swap `components` → `patterns` and add `components_used_resolved` in the output.

- [ ] **Step 3: Build + smoke-test**

```bash
npm run build && cat dist/api/components/magnetic-button.json | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/
git commit -m "feat(api): /api/components/[slug].json + /api/patterns/[slug].json"
```

### Task 6.3: `/tokens.json`

**Files:**
- Create: `src/pages/tokens.json.ts`

- [ ] **Step 1: Implement**

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const tokens = await getCollection('tokens');
  const keyed: Record<string, any> = {};
  for (const t of tokens) keyed[`${t.data.category}.${t.data.name}`] = t.data;
  return new Response(JSON.stringify(keyed, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/tokens.json.ts
git commit -m "feat(api): /tokens.json"
```

### Task 6.4: `/api` documentation page

**Files:**
- Create: `src/pages/api/index.astro`

- [ ] **Step 1: Implement**

```astro
---
import DocLayout from '../../layouts/DocLayout.astro';
---
<DocLayout title="API">
  <h1 class="font-display text-4xl mb-2">API</h1>
  <p class="text-bone/70 mb-8">Static endpoints emitted at build. All responses are cacheable and safe to curl.</p>

  <section class="space-y-6">
    <Endpoint method="GET" path="/api/index.json" desc="Full manifest of all components, patterns, tokens, voice (summary fields)." />
    <Endpoint method="GET" path="/api/components/<slug>.json" desc="Full component record — metadata, resolved tokens, related, source code." />
    <Endpoint method="GET" path="/api/patterns/<slug>.json" desc="Pattern record plus resolved components_used." />
    <Endpoint method="GET" path="/bundles/<slug>.md" desc="Copy-paste markdown bundle. Paste into any AI agent." />
    <Endpoint method="GET" path="/tokens.json" desc="Tokens keyed by <category>.<name>." />
    <Endpoint method="GET" path="/search-index.json" desc="Client-side fuzzy search index (Fuse.js shape)." />
  </section>

  <section class="mt-12">
    <h2 class="font-display text-2xl mb-3">Example</h2>
    <pre class="font-mono text-sm bg-elevated p-4 rounded-md border border-bone/10 overflow-auto"><code>curl -s https://system.djasha.me/bundles/magnetic-button.md | pbcopy</code></pre>
  </section>
</DocLayout>

<script>
  // noop — page is static
</script>
```

Create a simple `Endpoint.astro` snippet inline or extract:

```astro
---
const { method, path, desc } = Astro.props;
---
<div class="p-4 border border-bone/10 rounded-lg">
  <div class="flex items-baseline gap-3 mb-1">
    <span class="font-mono text-xs text-accent">{method}</span>
    <code class="font-mono text-sm">{path}</code>
  </div>
  <p class="text-sm text-bone/70">{desc}</p>
</div>
```

(Extract to `src/components/chrome/Endpoint.astro` if used more than once; inline for v1.)

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/index.astro
git commit -m "feat(pages): /api documentation page"
```

---

## Phase 7 — Polish

### Task 7.1: Global top nav

**Files:**
- Create: `src/components/chrome/Nav.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Implement `Nav.astro`**

```astro
---
const links = [
  { href: '/components', label: 'Components' },
  { href: '/patterns', label: 'Patterns' },
  { href: '/tokens', label: 'Tokens' },
  { href: '/voice', label: 'Voice' },
  { href: '/about', label: 'About' },
  { href: '/api', label: 'API' },
];
const current = Astro.url.pathname;
---
<nav class="border-b border-bone/10 bg-ink/80 backdrop-blur sticky top-0 z-40">
  <div class="max-w-content mx-auto px-6 py-3 flex items-center justify-between">
    <a href="/" class="font-display text-lg">Djasha System</a>
    <ul class="hidden md:flex gap-6 text-sm font-mono">
      {links.map((l) => (
        <li><a href={l.href} class={current.startsWith(l.href) ? 'text-accent' : 'text-bone/70 hover:text-bone'}>{l.label}</a></li>
      ))}
      <li><a href="https://github.com/djasha/system" class="text-bone/70 hover:text-bone">GitHub</a></li>
    </ul>
    <button class="md:hidden text-sm font-mono" onclick="document.dispatchEvent(new CustomEvent('commandk:open'))" aria-label="Open search">⌘K</button>
  </div>
</nav>
```

- [ ] **Step 2: Mount in `BaseLayout.astro`**

Add Nav above slot:

```astro
<body>
  <Nav />
  <slot />
  <CommandK client:idle />
</body>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/chrome/Nav.astro src/layouts/BaseLayout.astro
git commit -m "feat(chrome): global nav"
```

### Task 7.2: Theme toggle

**Files:**
- Create: `src/components/chrome/ThemeToggle.tsx`
- Modify: `src/layouts/BaseLayout.astro`, `src/components/chrome/Nav.astro`

- [ ] **Step 1: Implement**

```tsx
import { useEffect, useState } from 'react';
type Theme = 'dark' | 'light' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    setTheme(saved);
    apply(saved);
  }, []);
  const cycle = () => {
    const next: Theme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next); localStorage.setItem('theme', next); apply(next);
  };
  return <button onClick={cycle} aria-label={`Theme: ${theme}`} className="text-sm font-mono text-bone/70 hover:text-bone">{icon(theme)}</button>;
}

function apply(t: Theme) {
  const resolved = t === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  document.documentElement.setAttribute('data-theme', resolved);
}

function icon(t: Theme) { return { system: '◐', dark: '●', light: '○' }[t]; }
```

- [ ] **Step 2: Mount in Nav**

Add to the `<ul>` in `Nav.astro` just before the GitHub link:

```astro
<li><ThemeToggle client:idle /></li>
```

Add import: `import { ThemeToggle } from './ThemeToggle';`

- [ ] **Step 3: Initial inline script (prevent flash of wrong theme)**

In `BaseLayout.astro` `<head>`:

```astro
<script is:inline>
  (() => {
    const t = localStorage.getItem('theme') ?? 'system';
    const resolved = t === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
    document.documentElement.setAttribute('data-theme', resolved);
  })();
</script>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(chrome): theme toggle with system preference + no-flash script"
```

### Task 7.3: Home + About pages

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/about.astro`

- [ ] **Step 1: Flesh out home**

```astro
---
import DocLayout from '../layouts/DocLayout.astro';
import { getCollection } from 'astro:content';
const components = await getCollection('components');
const featured = components.slice(0, 4);
---
<DocLayout title="Home" description="An AI-native design system.">
  <section class="py-12">
    <h1 class="font-display text-6xl tracking-tight">An AI-native design system.</h1>
    <p class="text-xl text-bone/70 mt-6 max-w-2xl">Copy code, copy prompts, copy the whole bundle into Claude Code, Cursor, v0, or Bolt.</p>
    <div class="mt-8 flex gap-3">
      <a href="/components" class="px-4 py-2 bg-accent text-ink font-mono text-sm rounded-md">Browse components</a>
      <a href="/api" class="px-4 py-2 border border-bone/20 font-mono text-sm rounded-md">API reference</a>
    </div>
  </section>

  <section class="py-12">
    <h2 class="font-display text-2xl mb-6">How to use with any AI</h2>
    <ol class="space-y-4 text-bone/80">
      <li><span class="font-mono text-accent mr-2">1.</span> Pick a component.</li>
      <li><span class="font-mono text-accent mr-2">2.</span> Copy its Bundle tab.</li>
      <li><span class="font-mono text-accent mr-2">3.</span> Paste into any AI agent and ask it to port the component into your stack.</li>
    </ol>
  </section>

  <section class="py-12">
    <h2 class="font-display text-2xl mb-6">Featured</h2>
    <div class="grid sm:grid-cols-2 gap-4">
      {featured.map((c) => (
        <a href={`/components/${c.id.replace(/\.doc\.mdx$/, '')}`} class="block p-4 border border-bone/10 rounded-lg hover:border-accent/60">
          <h3 class="font-display">{c.data.name}</h3>
          <p class="text-sm text-bone/70 mt-1">{c.data.description}</p>
        </a>
      ))}
    </div>
  </section>
</DocLayout>
```

- [ ] **Step 2: Create about page**

```astro
---
import DocLayout from '../layouts/DocLayout.astro';
---
<DocLayout title="About">
  <h1 class="font-display text-4xl mb-6">About</h1>
  <div class="prose prose-invert max-w-none">
    <p>Djasha System is a reference library, built so any AI agent can read it.</p>
    <p>Every component ships three things: a live preview, the source code, and a natural-language prompt you can paste into Claude Code, Cursor, v0, or Bolt. There's also a full bundle — prompt plus resolved tokens plus source plus accessibility notes — in one clipboard-ready block.</p>
    <p>The system is maintained by <a href="https://djasha.me">Diaa Asha</a>. Source on <a href="https://github.com/djasha/system">GitHub</a>.</p>
  </div>
</DocLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro src/pages/about.astro
git commit -m "feat(pages): home + about"
```

### Task 7.4: OG images

**Files:**
- Create: `src/pages/og/[slug].png.ts`

- [ ] **Step 1: Configure `astro-og-canvas` integration**

Edit `astro.config.mjs` — add to integrations:

```js
// (no integration needed; astro-og-canvas provides an endpoint helper)
```

- [ ] **Step 2: Implement `/og/[slug].png.ts`**

```ts
import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';

const components = await getCollection('components');
const pages = Object.fromEntries(components.map((c) => [
  c.id.replace(/\.doc\.mdx$/, ''),
  { title: c.data.name, description: c.data.description },
]));

export const { getStaticPaths, GET } = OGImageRoute({
  pages,
  param: 'slug',
  getImageOptions: (_path, page: { title: string; description: string }) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[10, 6, 6]],
    border: { color: [232, 70, 44], width: 4, side: 'inline-start' },
    padding: 80,
    font: {
      title: { size: 72, color: [245, 241, 236], weight: 'ExtraBold' },
      description: { size: 32, color: [245, 241, 236], weight: 'Normal' },
    },
  }),
});
```

- [ ] **Step 3: Reference in detail page `<head>`**

In `src/pages/components/[slug].astro`, add to the Astro props passed into `BaseLayout` via the DocLayout, OR add a slot to BaseLayout for `<meta>` tags. Simplest: add to BaseLayout head via a new prop:

```astro
// BaseLayout props
interface Props { title: string; description?: string; ogImage?: string; }
```

Then in `[slug].astro`:

```astro
<DocLayout title={entry.data.name} description={entry.data.description} ogImage={`/og/${slug}.png`}>
```

And in BaseLayout head:

```astro
{ogImage && <meta property="og:image" content={new URL(ogImage, Astro.site).toString()} />}
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
```

- [ ] **Step 4: Build + check**

```bash
npm run build && ls dist/og/
```

Expected: `magnetic-button.png` exists.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(og): auto-generated OG images per component"
```

### Task 7.5: Playwright smoke test

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Init Playwright config**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: Write smoke test**

```ts
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('home loads and links to components', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AI-native design system/i })).toBeVisible();
  await page.getByRole('link', { name: /browse components/i }).click();
  await expect(page).toHaveURL(/\/components/);
});

test('component detail renders all four tabs', async ({ page }) => {
  await page.goto('/components/magnetic-button');
  await expect(page.getByRole('heading', { name: 'MagneticButton' })).toBeVisible();
  for (const label of ['Preview', 'Code', 'Prompt', 'Bundle']) {
    await page.getByRole('tab', { name: label }).click();
  }
});

test('Command-K opens on cmd+k and filters', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Meta+K');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByPlaceholder(/search/i).fill('magnetic');
  await expect(page.getByText(/MagneticButton/i)).toBeVisible();
});

test('bundle endpoint returns markdown', async ({ request }) => {
  const res = await request.get('/bundles/magnetic-button.md');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/^# MagneticButton/);
});
```

- [ ] **Step 3: Add npm scripts**

```json
{ "scripts": { "test:e2e": "playwright test" } }
```

- [ ] **Step 4: Run**

```bash
npm run build && npm run test:e2e
```

Expected: 4 tests pass.

- [ ] **Step 5: Add to CI (`.github/workflows/ci.yml`)**

Append after the `build` step:

```yaml
      - run: npx playwright install chromium
      - run: npm run test:e2e
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(e2e): Playwright smoke tests for home/detail/cmdK/bundle"
```

---

## Phase 8 — Migrate remaining 7 components

For each component, the full template is identical to Task 3.4 + 3.5. Content differs per component. The scaffolding script below removes duplication.

### Task 8.1: Component scaffolder script

**Files:**
- Create: `scripts/scaffold-component.ts`

- [ ] **Step 1: Implement**

```ts
import fs from 'node:fs';
import path from 'node:path';

const name = process.argv[2];
if (!name) { console.error('Usage: tsx scripts/scaffold-component.ts <ComponentName>'); process.exit(1); }
const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const doc = `---
name: ${name}
description: TODO — one-sentence description.
category: display
tags: []
tokens_used: []
related: []
status: experimental
source_path: src/components/${name}.tsx
a11y_notes: TODO.
created: ${new Date().toISOString().split('T')[0]}
---

## Prompt

TODO — natural-language brief.

## Usage

TODO — when to use, when not.

## Do / Don't

- **Do** TODO.
- **Don't** TODO.
`;

const playground = `export const knobs = [] as const;
export type KnobValues = {};
export function toCode(_v: KnobValues): string { return \`<${name} />\`; }
`;

const preview = `import { ${name} } from './${name}';
export default function Demo() { return <${name} />; }
`;

fs.mkdirSync('src/content/components', { recursive: true });
fs.writeFileSync(`src/content/components/${slug}.doc.mdx`, doc);
fs.writeFileSync(`src/components/${name}.playground.tsx`, playground);
fs.writeFileSync(`src/components/${name}.preview.tsx`, preview);
console.log(`Scaffolded ${name} (slug: ${slug}). Fill in TODOs in:`);
console.log(`  src/content/components/${slug}.doc.mdx`);
console.log(`  src/components/${name}.playground.tsx (add knobs + toCode)`);
```

- [ ] **Step 2: Add npm script + commit**

Add to package.json: `"scaffold": "tsx scripts/scaffold-component.ts"`.

```bash
git add scripts/scaffold-component.ts package.json
git commit -m "feat(scripts): scaffold-component CLI"
```

### Tasks 8.2–8.8: Migrate each remaining component

**Template (repeat per component — NOT identical code, different component + content each time):**

Components to migrate, in this order:
1. `TiltCard` (task 8.2)
2. `ScrollMarquee` (task 8.3)
3. `CustomCursor` (task 8.4)
4. `StackingCards` (task 8.5)
5. `ParallaxImage` (task 8.6)
6. `CharacterReveal` (task 8.7)
7. `AnimatedText` (task 8.8)

For each:

- [ ] **Step 1: Copy source from portfolio**

```bash
cp /Users/Djasha/portfolio-remake/site/src/components/<Name>.tsx /Users/Djasha/djasha-system/src/components/<Name>.tsx
```

- [ ] **Step 2: Scaffold doc + helpers**

```bash
npm run scaffold -- <Name>
```

- [ ] **Step 3: Remove portfolio-specific imports** from the ported source file; ensure typed props exist for the playground.

- [ ] **Step 4: Fill in `src/content/components/<slug>.doc.mdx`** — replace every TODO (description, tokens_used, related, a11y_notes, prompt/usage/do-don't). Use MagneticButton's doc as a reference.

- [ ] **Step 5: Fill in `src/components/<Name>.playground.tsx`** — define actual knobs that map to this component's props, write `toCode` to reflect them. For components where interactivity doesn't make sense (e.g., `ParallaxImage` — purely scroll-driven), leave knobs empty and `toCode` returns the static form.

- [ ] **Step 6: Register in `PlaygroundIsland` + `PreviewIsland` registries** — add lines:

```tsx
'<slug>': { loadConfig: () => import('../<Name>.playground'), loadDemo: () => import('../<Name>.preview') },
```

- [ ] **Step 7: Run checks + build**

```bash
npm run check:all && npm run build
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(components): migrate <Name>"
```

(Repeat steps 1-8 for each component. Tasks 8.2 through 8.8.)

---

## Phase 9 — Ship

### Task 9.1: Configure Coolify deployment

**Files:**
- Create: `Dockerfile` (if Coolify requires) or `.coolify/config.yml` (verify which Coolify flow applies to this repo type)

- [ ] **Step 1: Add a minimal Dockerfile**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
```

- [ ] **Step 2: Add `Caddyfile`**

```
:80 {
    root * /usr/share/caddy
    file_server
    encode gzip
    try_files {path} {path}/ /404.html
}
```

- [ ] **Step 3: In Coolify UI**

- Create new Application → Source: GitHub `djasha/system` → Branch: `main`
- Build Pack: Dockerfile
- Expose port 80
- Attach domain `system.djasha.me` → TLS auto via Traefik
- Save, deploy

- [ ] **Step 4: Commit**

```bash
git add Dockerfile Caddyfile
git commit -m "chore(deploy): Dockerfile + Caddyfile for Coolify"
```

### Task 9.2: DNS + push

- [ ] **Step 1: Verify no existing record for `system.djasha.me`**

Use Cloudflare dashboard (or equivalent). If clear, add a CNAME to the Coolify host.

- [ ] **Step 2: Push to GitHub**

```bash
# one-time: create repo on GitHub
gh repo create djasha/system --private --source=. --remote=origin --push
```

- [ ] **Step 3: Verify deploy**

- Coolify triggers build on push.
- Watch logs; first build takes ~3 minutes.
- Visit `https://system.djasha.me` — home page loads, TLS green.

### Task 9.3: Run success-criteria checklist

Walk through §9 of the spec. Each item should pass:

- [ ] Public site live at `system.djasha.me`, TLS green.
- [ ] At least 8 components migrated: MagneticButton, TiltCard, ScrollMarquee, CustomCursor, StackingCards, ParallaxImage, CharacterReveal, AnimatedText.
- [ ] All 4 tabs functional on every migrated component.
- [ ] Playground knobs working on at least 4 components.
- [ ] Command-K search returns relevant results.
- [ ] CI guards block merges on doc-coverage / reference / schema failures (test by opening a PR that removes a `.doc.mdx`).
- [ ] `/api/*.json` and `/bundles/*.md` endpoints return 200 and match documented shapes.
- [ ] OG images generated for every component detail page (check `/og/magnetic-button.png`).
- [ ] Mobile responsive on all pages (375px viewport check).
- [ ] Passes WCAG AA keyboard-navigation check — tab through home → components → detail, every interactive target reachable and focus-visible.

If any item fails, fix and re-ship. No red items at launch.

- [ ] **Commit any launch fixes:**

```bash
git commit -m "fix(launch): <what>"
git push
```

### Task 9.4: Add phase-2-notes.md

Per spec §8: capture deferred decisions in the repo for Phase 2 context.

**Files:**
- Create: `docs/phase-2-notes.md`

- [ ] **Step 1: Create the file with initial observations from v1 build**

```markdown
# Phase 2 notes

Deferred decisions captured during v1 build. Revisit when starting Phase 2 (Payload-backed admin).

## What Phase 2 adds

1. Payload collection inside `studio.djasha.me` mirroring `src/content.config.ts` schemas 1:1.
2. Custom "Design" block in Payload admin that calls Claude API, returns code + metadata, writes source file + collection entry.
3. `pull:payload` script that hydrates local MDX/YAML from Payload before each build.
4. Webhook from Payload `afterChange` → GitHub Actions trigger → rebuild.

## Observations from v1 (update as discovered)

- [ ] Note any content-model quirks that will complicate Payload mirroring.
- [ ] Note any per-component config that isn't captured in frontmatter (e.g. custom preview wrappers).
- [ ] Track bundle sizes — if any exceed 8KB, plan a URL-only fallback before Phase 2.

## Auth

- Payload's native access control handles admin auth. Source-of-truth API tokens issued per-agent if external agents (Claude Code, Cursor, curl) should be allowed to POST.
- Rate-limit POST endpoints at the Payload layer before exposing externally.
```

- [ ] **Step 2: Commit**

```bash
git add docs/phase-2-notes.md
git commit -m "docs: add phase-2-notes stub per spec §8"
```

---

## Self-review notes (done at plan-writing time, fixed inline)

**Spec coverage** — walked each spec section; every requirement maps to a task. Gaps caught and fixed inline:
- Spec §5's "bonus stale-doc warn" now exists as Task 2.4.
- Spec §8's `docs/phase-2-notes.md` now exists as Task 9.4.
- Task 4.1 created `ComponentCard.astro` that Task 4.4 rendered redundant; Task 4.4 now explicitly deletes it.

**Type consistency** — `KnobSpec` (runtime definition) vs `KnobValues` (resolved state) are distinct by design; no conflict. `slugify` regex is identical in Task 2.1 (CI) and Task 8.1 (scaffolder). `entry.id` stripping via `.replace(/\.doc\.mdx$/, '')` used consistently across API endpoints, getStaticPaths, and registries.

**Minor duplication** — `extractSection(body, heading)` defined inline in both `[slug].astro` and `/bundles/[slug].md.ts`. Acceptable v1 duplication; optional refactor to `src/lib/mdx-sections.ts` if touched again.

**Unused v1 export** — `resolveTokens` in `src/lib/tokens.ts` is TDD-tested but the actual API endpoints build the token map inline. Kept because Phase 2 Payload hydration will consume it.

**TDD coverage** — Full red-green on CI scripts, bundle composer, token resolver. UI surfaces skip unit TDD in favour of Playwright smoke (Task 7.5).

**Frequent commits** — every task ends with a commit; ~45 commits across the plan.

**Placeholders** — all "TODO" strings in code blocks are inside Task 8.1's scaffolder output template, which correctly emits TODOs for the engineer to fill during per-component migration. None elsewhere.

---

**End of plan.**
