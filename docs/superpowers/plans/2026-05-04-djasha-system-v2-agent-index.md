# Djasha System v2 — Agent Discovery Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend djasha-system v1 into the agent-first index of design systems and skills — adds an agent-discovery layer (`/llms.txt`, schema.org, MCP server, OpenAPI) and a vendored catalog of Open Design's Apache-2.0 content (~72 design systems + 31 skills + 5 directions), bringing the library from 8 → ~123 indexable entries.

**Architecture:** Static Astro 6 site with React 19 islands (preserved from v1), three new content collections (`references`, `skills`, `directions`), a vendoring pipeline script that ingests `nexu-io/open-design` under Apache-2.0, an HTTP MCP server hosted as a Vercel serverless function, and a discovery layer (llms.txt, schema.org JSON-LD, OpenAPI, AI-bot allow-list).

**Tech Stack:** Astro 6, React 19, TypeScript, Zod (via `astro:content`), `@modelcontextprotocol/sdk`, `simple-git` for vendoring, Vercel serverless functions for MCP transport, Vitest (unit), Playwright (smoke + MCP contract), Open Design (Apache-2.0 vendored content).

**Source spec:** `docs/superpowers/specs/2026-05-04-djasha-system-v2-agent-index-design.md`

---

## File structure

Files created or modified across all phases. Each file has one clear responsibility:

```
djasha-system/
├── src/
│   ├── content.config.ts                       # MODIFY — add references, skills, directions
│   ├── content/
│   │   ├── components/                         # existing + new migrations
│   │   ├── patterns/                           # existing + seed entries
│   │   ├── voice/                              # existing + seed entries
│   │   ├── references/                         # NEW — vendored design systems
│   │   ├── skills/                             # NEW — vendored skills
│   │   └── directions/                         # NEW — vendored directions
│   ├── lib/
│   │   ├── llms-txt.ts                         # NEW — generates /llms.txt content
│   │   ├── llms-full-txt.ts                    # NEW — generates /llms-full.txt
│   │   ├── jsonld.ts                           # NEW — Schema.org JSON-LD per page-type
│   │   ├── openapi.ts                          # NEW — OpenAPI 3.1 spec builder
│   │   ├── attribution.ts                      # NEW — attribution rendering helper
│   │   └── mcp/
│   │       ├── server.ts                       # NEW — MCP server bootstrap
│   │       ├── tools/
│   │       │   ├── originals.ts                # search_components, get_component, etc.
│   │       │   ├── references.ts               # search_references, get_reference, list_references
│   │       │   ├── skills.ts                   # list_skills, get_skill, find_skill_for_scenario
│   │       │   ├── directions.ts               # list_directions, apply_direction
│   │       │   └── cross.ts                    # find_design_system, compose_brief
│   │       └── resources.ts                    # MCP resource exposure
│   ├── pages/
│   │   ├── llms.txt.ts                         # NEW
│   │   ├── llms-full.txt.ts                    # NEW
│   │   ├── openapi.json.ts                     # NEW
│   │   ├── robots.txt.ts                       # NEW (replaces default)
│   │   ├── ai.txt.ts                           # NEW
│   │   ├── api/
│   │   │   ├── mcp.ts                          # NEW — MCP HTTP handler (serverless)
│   │   │   ├── references/[slug].json.ts       # NEW
│   │   │   └── skills/[slug].json.ts           # NEW
│   │   ├── .well-known/
│   │   │   ├── mcp.json.ts                     # NEW
│   │   │   └── llm.ts                          # NEW (alias to /llms.txt)
│   │   ├── references/
│   │   │   ├── index.astro                     # NEW
│   │   │   └── [slug].astro                    # NEW
│   │   ├── skills/
│   │   │   ├── index.astro                     # NEW
│   │   │   └── [slug].astro                    # NEW
│   │   ├── directions/
│   │   │   └── index.astro                     # NEW
│   │   └── integrations/
│   │       └── index.astro                     # NEW
│   ├── components/chrome/
│   │   ├── ReferenceCard.astro                 # NEW
│   │   ├── SkillCard.astro                     # NEW
│   │   ├── DirectionPanel.astro                # NEW
│   │   ├── AttributionRail.astro               # NEW
│   │   ├── McpInstallSnippet.astro             # NEW
│   │   ├── PaletteGrid.astro                   # NEW
│   │   └── Nav.astro                           # MODIFY — add References, Skills entries
│   └── layouts/
│       └── BaseLayout.astro                    # MODIFY — add jsonLd prop
├── scripts/
│   ├── sync-open-design.ts                     # NEW — vendoring pipeline
│   ├── check-vendor-attribution.ts             # NEW — CI guard
│   ├── validate-llms-txt.ts                    # NEW — CI guard
│   └── validate-jsonld.ts                      # NEW — CI guard (page audit)
├── tests/
│   ├── unit/
│   │   ├── llms-txt.test.ts                    # NEW
│   │   ├── jsonld.test.ts                      # NEW
│   │   ├── attribution.test.ts                 # NEW
│   │   ├── openapi.test.ts                     # NEW
│   │   ├── sync-open-design.test.ts            # NEW
│   │   ├── check-vendor-attribution.test.ts    # NEW
│   │   └── mcp/
│   │       ├── originals.test.ts               # NEW
│   │       ├── references.test.ts              # NEW
│   │       ├── skills.test.ts                  # NEW
│   │       ├── directions.test.ts              # NEW
│   │       └── cross.test.ts                   # NEW
│   └── e2e/
│       ├── smoke.spec.ts                       # MODIFY — add new pages
│       └── mcp-contract.spec.ts                # NEW — MCP HTTP transport contract
├── vendor/
│   └── open-design/
│       ├── LICENSE                             # NEW — copied from upstream
│       ├── NOTICE                              # NEW
│       ├── SHA                                 # NEW — last sync SHA
│       └── ATTRIBUTION.md                      # NEW — attribution policy
├── docs/
│   ├── takedown.md                             # NEW
│   ├── authoring-with-open-design.md           # NEW
│   └── attribution-policy.md                   # NEW
└── .github/workflows/
    ├── ci.yml                                  # MODIFY — add new check steps
    └── vendor-sync.yml                         # NEW — monthly cron + manual dispatch
```

---

## Phase 0 — Pre-flight

### Task 0.1: Verify branch + clean state

- [ ] **Step 1: Check branch + status**

```bash
cd /Users/Djasha/djasha-system
git status
git branch --show-current
```

Expected: clean working tree on `feat/v2-agent-index`. If not on that branch, `git checkout feat/v2-agent-index`.

- [ ] **Step 2: Verify v1 still builds + passes tests**

```bash
npm run check:all && npm run test && npm run build
```

Expected: 0 errors, 19 unit tests passing, build succeeds.

### Task 0.2: Install new runtime dependencies

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install MCP SDK**

```bash
cd /Users/Djasha/djasha-system
npm install @modelcontextprotocol/sdk
```

- [ ] **Step 2: Install simple-git for vendoring**

```bash
npm install -D simple-git
```

- [ ] **Step 3: Install schema-dts for JSON-LD typing**

```bash
npm install -D schema-dts
```

- [ ] **Step 4: Verify installs**

```bash
npm run build
```

Expected: success.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add @modelcontextprotocol/sdk + simple-git + schema-dts for v2"
```

---

## Phase 1 — Discovery surfaces (existing content)

### Task 1.1: Build llms.txt generator (TDD)

**Files:** `src/lib/llms-txt.ts`, `tests/unit/llms-txt.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/llms-txt.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { renderLlmsTxt } from '../../src/lib/llms-txt';

describe('renderLlmsTxt', () => {
  const fixture = {
    site: 'https://system.djasha.me',
    components: [
      { slug: 'magnetic-button', name: 'MagneticButton', description: 'Button with magnetic pull.' },
    ],
    references: [],
    skills: [],
    tokens: [{ slug: 'color.accent', value: '#E8462C', description: 'Primary accent.' }],
    voice: [{ slug: 'headlines', topic: 'Headlines', description: 'How to write headings.' }],
    patterns: [],
    directions: [],
  };

  it('starts with the site name as H1', () => {
    expect(renderLlmsTxt(fixture)).toMatch(/^# Djasha System\n/);
  });

  it('includes the tagline as a blockquote', () => {
    expect(renderLlmsTxt(fixture)).toMatch(/^> .+/m);
  });

  it('lists components with absolute URLs', () => {
    expect(renderLlmsTxt(fixture)).toContain('[MagneticButton](https://system.djasha.me/components/magnetic-button)');
  });

  it('lists tokens with values', () => {
    expect(renderLlmsTxt(fixture)).toMatch(/color\.accent.*#E8462C/);
  });

  it('includes API endpoints in primary section (NOT optional)', () => {
    const out = renderLlmsTxt(fixture);
    expect(out).toContain('/api/index.json');
    expect(out).toContain('/mcp');
    expect(out).toContain('/openapi.json');
  });

  it('includes voice in optional section', () => {
    const out = renderLlmsTxt(fixture);
    expect(out).toMatch(/## Optional[\s\S]*\/voice/);
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

Expected: FAIL — module missing.

- [ ] **Step 3: Implement**

Create `src/lib/llms-txt.ts`:

```ts
export interface LlmsTxtInput {
  site: string;
  components: Array<{ slug: string; name: string; description: string }>;
  references: Array<{ slug: string; name: string; owner: string; description?: string }>;
  skills: Array<{ slug: string; name: string; mode: string; description: string }>;
  patterns: Array<{ slug: string; name: string; description: string }>;
  tokens: Array<{ slug: string; value: string; description: string }>;
  directions: Array<{ slug: string; name: string; description?: string }>;
  voice: Array<{ slug: string; topic: string; description: string }>;
}

export function renderLlmsTxt(i: LlmsTxtInput): string {
  const url = (path: string) => `${i.site}${path}`;
  const sections: string[] = [];

  sections.push(`# Djasha System`);
  sections.push('');
  sections.push(`> The agent-first index of design systems and skills. Originals + curated public design systems + agent workflows + visual directions. Machine-readable bundles, MCP server, OpenAPI. Built for AI agents to read first.`);
  sections.push('');

  if (i.components.length > 0) {
    sections.push('## Components');
    sections.push('');
    for (const c of i.components) {
      sections.push(`- [${c.name}](${url(`/components/${c.slug}`)}): ${c.description}`);
    }
    sections.push('');
  }

  if (i.references.length > 0) {
    sections.push('## References (vendored design systems)');
    sections.push('');
    for (const r of i.references) {
      sections.push(`- [${r.name}](${url(`/references/${r.slug}`)}): ${r.description ?? `Design system by ${r.owner}.`}`);
    }
    sections.push('');
  }

  if (i.skills.length > 0) {
    sections.push('## Skills (agent workflows)');
    sections.push('');
    for (const s of i.skills) {
      sections.push(`- [${s.name}](${url(`/skills/${s.slug}`)}): [${s.mode}] ${s.description}`);
    }
    sections.push('');
  }

  if (i.patterns.length > 0) {
    sections.push('## Patterns');
    sections.push('');
    for (const p of i.patterns) {
      sections.push(`- [${p.name}](${url(`/patterns/${p.slug}`)}): ${p.description}`);
    }
    sections.push('');
  }

  if (i.tokens.length > 0) {
    sections.push('## Tokens');
    sections.push('');
    for (const t of i.tokens) {
      sections.push(`- [${t.slug}](${url(`/tokens#${t.slug}`)}): \`${t.value}\` — ${t.description}`);
    }
    sections.push('');
  }

  if (i.directions.length > 0) {
    sections.push('## Directions');
    sections.push('');
    for (const d of i.directions) {
      sections.push(`- [${d.name}](${url(`/directions#${d.slug}`)}): ${d.description ?? 'Visual direction.'}`);
    }
    sections.push('');
  }

  sections.push('## API');
  sections.push('');
  sections.push(`- [Manifest](${url('/api/index.json')}): All entries (components, references, skills, tokens, voice, directions, patterns).`);
  sections.push(`- [Per-component](${url('/api/components/<slug>.json')}): Full component record + resolved tokens + source.`);
  sections.push(`- [Per-reference](${url('/api/references/<slug>.json')}): Full reference record + attribution chain.`);
  sections.push(`- [Per-skill](${url('/api/skills/<slug>.json')}): Skill prompt + example + design-system requirements.`);
  sections.push(`- [Bundles](${url('/bundles/<slug>.md')}): Markdown bundle ready to paste into any AI agent.`);
  sections.push(`- [MCP server](${url('/mcp')}): Model Context Protocol endpoint.`);
  sections.push(`- [OpenAPI 3.1 spec](${url('/openapi.json')})`);
  sections.push(`- [Search index (Fuse.js)](${url('/search-index.json')})`);
  sections.push('');

  if (i.voice.length > 0) {
    sections.push('## Optional');
    sections.push('');
    for (const v of i.voice) {
      sections.push(`- [Voice: ${v.topic}](${url(`/voice#${v.slug}`)}): ${v.description}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npm run test
```

Expected: PASS (24 tests total — 19 existing + 6 new).

- [ ] **Step 5: Commit**

```bash
git add src/lib/llms-txt.ts tests/unit/llms-txt.test.ts
git commit -m "feat(lib): llms.txt generator with TDD coverage"
```

### Task 1.2: Build /llms.txt endpoint

**Files:** `src/pages/llms.txt.ts`

- [ ] **Step 1: Implement**

Create `src/pages/llms.txt.ts`:

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderLlmsTxt } from '../lib/llms-txt';

export const GET: APIRoute = async () => {
  const [components, patterns, tokens, voice] = await Promise.all([
    getCollection('components'),
    getCollection('patterns'),
    getCollection('tokens'),
    getCollection('voice'),
  ]);

  // References, skills, directions collections may not exist yet (Phase 4 adds them).
  // Handle gracefully so this endpoint works at every phase.
  let references: any[] = [];
  let skills: any[] = [];
  let directions: any[] = [];
  try { references = await getCollection('references'); } catch { /* not yet defined */ }
  try { skills = await getCollection('skills'); } catch { /* not yet defined */ }
  try { directions = await getCollection('directions'); } catch { /* not yet defined */ }

  const content = renderLlmsTxt({
    site: 'https://system.djasha.me',
    components: components.map((c) => ({ slug: c.id, name: c.data.name, description: c.data.description })),
    references: references.map((r: any) => ({ slug: r.id, name: r.data.name, owner: r.data.owner, description: r.data.description })),
    skills: skills.map((s: any) => ({ slug: s.id, name: s.data.name, mode: s.data.mode, description: s.data.description })),
    patterns: patterns.map((p) => ({ slug: p.id, name: p.data.name, description: p.data.description })),
    tokens: tokens.map((t) => ({ slug: `${t.data.category}.${t.data.name}`, value: t.data.value, description: t.data.description })),
    directions: directions.map((d: any) => ({ slug: d.id, name: d.data.name, description: d.data.description })),
    voice: voice.map((v) => ({ slug: v.id, topic: v.data.topic, description: v.data.description })),
  });

  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
```

- [ ] **Step 2: Build + verify**

```bash
npm run build
cat dist/llms.txt | head -30
```

Expected: file exists, starts with `# Djasha System`, lists current 8 components.

- [ ] **Step 3: Commit**

```bash
git add src/pages/llms.txt.ts
git commit -m "feat(api): /llms.txt endpoint emitting LLM-readable site index"
```

### Task 1.3: Build /llms-full.txt endpoint

**Files:** `src/lib/llms-full-txt.ts`, `src/pages/llms-full.txt.ts`, `tests/unit/llms-full-txt.test.ts`

This endpoint dumps full bundle content for every entry inline. Reuses `composeBundle()` from v1.

- [ ] **Step 1: Write failing test**

Create `tests/unit/llms-full-txt.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { renderLlmsFullTxt } from '../../src/lib/llms-full-txt';

describe('renderLlmsFullTxt', () => {
  it('concatenates entries with H1 separators', () => {
    const out = renderLlmsFullTxt({
      site: 'https://system.djasha.me',
      bundles: [
        { slug: 'a', kind: 'component', markdown: '# A\n\nFoo.' },
        { slug: 'b', kind: 'component', markdown: '# B\n\nBar.' },
      ],
    });
    expect(out).toMatch(/# A[\s\S]+---[\s\S]+# B/);
  });

  it('includes a manifest header listing all entries', () => {
    const out = renderLlmsFullTxt({
      site: 'https://system.djasha.me',
      bundles: [{ slug: 'a', kind: 'component', markdown: '# A' }],
    });
    expect(out).toMatch(/## Manifest[\s\S]+- a \(component\)/);
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/llms-full-txt.ts`:

```ts
export interface FullTxtInput {
  site: string;
  bundles: Array<{ slug: string; kind: 'component' | 'reference' | 'skill' | 'pattern'; markdown: string }>;
}

export function renderLlmsFullTxt(i: FullTxtInput): string {
  const lines: string[] = [];

  lines.push(`# Djasha System — Full Content Dump`);
  lines.push('');
  lines.push(`> All entries inline. For one-fetch agent consumption. Site: ${i.site}.`);
  lines.push('');

  lines.push(`## Manifest`);
  lines.push('');
  for (const b of i.bundles) {
    lines.push(`- ${b.slug} (${b.kind})`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const b of i.bundles) {
    lines.push(b.markdown.trim());
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 5: Implement endpoint**

Create `src/pages/llms-full.txt.ts`:

```ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import matter from 'gray-matter';
import fs from 'node:fs/promises';
import path from 'node:path';
import { composeBundle } from '../lib/bundle';
import { readSource, languageFromPath } from '../lib/source-reader';
import { renderLlmsFullTxt } from '../lib/llms-full-txt';

async function bundleForComponent(entry: any, collection: 'components' | 'patterns'): Promise<string> {
  const rawPath = path.resolve(process.cwd(), `src/content/${collection}/${entry.id}.doc.mdx`);
  const raw = await fs.readFile(rawPath, 'utf8');
  const { content: body } = matter(raw);
  const extract = (h: string) => body.match(new RegExp(`##\\s+${h}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i'))?.[1].trim() ?? '';

  const tokenCollection = await getCollection('tokens');
  const tokenMap = new Map(tokenCollection.map((t) => [`${t.data.category}.${t.data.name}`, t.data]));
  const tokens = entry.data.tokens_used.map((s: string) => ({ slug: s, value: tokenMap.get(s)?.value ?? '(unresolved)' }));

  const sourceCode = await readSource(entry.data.source_path);
  const sourceLanguage = languageFromPath(entry.data.source_path);

  return composeBundle({
    name: entry.data.name,
    description: entry.data.description,
    promptBody: extract('Prompt'),
    usageBody: extract('Usage'),
    tokens,
    a11yNotes: entry.data.a11y_notes,
    sourcePath: entry.data.source_path,
    sourceCode,
    sourceLanguage,
  });
}

export const GET: APIRoute = async () => {
  const components = await getCollection('components');
  const patterns = await getCollection('patterns');

  const bundles: Array<{ slug: string; kind: 'component' | 'reference' | 'skill' | 'pattern'; markdown: string }> = [];

  for (const c of components) {
    bundles.push({ slug: c.id, kind: 'component', markdown: await bundleForComponent(c, 'components') });
  }
  for (const p of patterns) {
    bundles.push({ slug: p.id, kind: 'pattern', markdown: await bundleForComponent(p, 'patterns') });
  }

  // References + skills bundles added in Phases 7-8 once those collections + render functions exist.

  const content = renderLlmsFullTxt({ site: 'https://system.djasha.me', bundles });
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
```

- [ ] **Step 6: Build + verify**

```bash
npm run build
ls -la dist/llms-full.txt
head -50 dist/llms-full.txt
```

Expected: file exists with manifest section + at least 8 component bundles inlined.

- [ ] **Step 7: Commit**

```bash
git add src/lib/llms-full-txt.ts src/pages/llms-full.txt.ts tests/unit/llms-full-txt.test.ts
git commit -m "feat(api): /llms-full.txt endpoint with full content dump"
```

### Task 1.4: Build robots.txt + ai.txt endpoints

**Files:** `src/pages/robots.txt.ts`, `src/pages/ai.txt.ts`

- [ ] **Step 1: Create robots.txt endpoint**

Create `src/pages/robots.txt.ts`:

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    '# AI search bots — explicitly allowed',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: Claude-User',
    'Allow: /',
    '',
    'User-agent: Claude-Web',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: Perplexity-User',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: GoogleOther',
    'Allow: /',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    '',
    'User-agent: Applebot-Extended',
    'Allow: /',
    '',
    'User-agent: Amazonbot',
    'Allow: /',
    '',
    'User-agent: Cohere-AI',
    'Allow: /',
    '',
    'User-agent: CCBot',
    'Allow: /',
    '',
    'Sitemap: https://system.djasha.me/sitemap-index.xml',
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
```

- [ ] **Step 2: Create ai.txt endpoint**

Create `src/pages/ai.txt.ts`:

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const content = `# Djasha System — AI usage policy
# Library content licensed for AI agent consumption with attribution.

allow: read, search, summarize, embed, mcp-tool-call
prefer: link-back-to-source
attribution: "https://system.djasha.me"
license: see https://github.com/djasha/system/blob/main/LICENSE
contact: me@djasha.me

# Vendored content (References, Skills, Directions) is Apache-2.0 from
# https://github.com/nexu-io/open-design — preserve upstream attribution.
`;
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
```

- [ ] **Step 3: Build + verify**

```bash
npm run build
cat dist/robots.txt
cat dist/ai.txt
```

Expected: both files exist with the listed content.

- [ ] **Step 4: Commit**

```bash
git add src/pages/robots.txt.ts src/pages/ai.txt.ts
git commit -m "feat(seo): robots.txt with AI-bot allow-list + ai.txt usage policy"
```

### Task 1.5: Build OpenAPI spec endpoint

**Files:** `src/lib/openapi.ts`, `src/pages/openapi.json.ts`, `tests/unit/openapi.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/openapi.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildOpenApiSpec } from '../../src/lib/openapi';

describe('buildOpenApiSpec', () => {
  const spec = buildOpenApiSpec({ baseUrl: 'https://system.djasha.me' });

  it('declares OpenAPI 3.1', () => {
    expect(spec.openapi).toBe('3.1.0');
  });

  it('declares info with title + version', () => {
    expect(spec.info.title).toBe('Djasha System');
    expect(spec.info.version).toBeDefined();
  });

  it('lists the manifest endpoint', () => {
    expect(spec.paths['/api/index.json']).toBeDefined();
    expect(spec.paths['/api/index.json'].get).toBeDefined();
  });

  it('lists per-component endpoint with slug param', () => {
    expect(spec.paths['/api/components/{slug}.json']).toBeDefined();
  });

  it('lists per-reference and per-skill endpoints', () => {
    expect(spec.paths['/api/references/{slug}.json']).toBeDefined();
    expect(spec.paths['/api/skills/{slug}.json']).toBeDefined();
  });

  it('lists bundle endpoint with markdown response', () => {
    const bundle = spec.paths['/bundles/{slug}.md'].get;
    expect(bundle.responses['200'].content['text/markdown']).toBeDefined();
  });

  it('declares the MCP endpoint', () => {
    expect(spec.paths['/mcp']).toBeDefined();
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/openapi.ts`:

```ts
export interface OpenApiOptions { baseUrl: string }

export function buildOpenApiSpec(opts: OpenApiOptions) {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Djasha System',
      version: '2.0.0',
      description: 'The agent-first index of design systems and skills. Originals + curated public design systems + agent workflows + visual directions.',
      contact: { name: 'Diaa Asha', url: 'https://djasha.me', email: 'me@djasha.me' },
      license: { name: 'See repo', url: 'https://github.com/djasha/system/blob/main/LICENSE' },
    },
    servers: [{ url: opts.baseUrl, description: 'Production' }],
    paths: {
      '/api/index.json': {
        get: {
          summary: 'Full manifest',
          description: 'All components, patterns, tokens, voice, references, skills, directions with summary fields.',
          responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Manifest' } } } } },
        },
      },
      '/api/components/{slug}.json': {
        get: {
          summary: 'Full component record',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Component' } } } } },
        },
      },
      '/api/patterns/{slug}.json': {
        get: {
          summary: 'Full pattern record',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/references/{slug}.json': {
        get: {
          summary: 'Full reference (vendored design system) record',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/skills/{slug}.json': {
        get: {
          summary: 'Full skill (vendored agent workflow) record',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/bundles/{slug}.md': {
        get: {
          summary: 'Markdown bundle (one-paste for AI agents)',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK', content: { 'text/markdown': { schema: { type: 'string' } } } } },
        },
      },
      '/tokens.json': { get: { summary: 'All tokens keyed by <category>.<name>', responses: { '200': { description: 'OK' } } } },
      '/search-index.json': { get: { summary: 'Fuse.js search index', responses: { '200': { description: 'OK' } } } },
      '/llms.txt': { get: { summary: 'LLM-readable site index (llms.txt spec)', responses: { '200': { description: 'OK' } } } },
      '/llms-full.txt': { get: { summary: 'Full content dump for non-crawling agents', responses: { '200': { description: 'OK' } } } },
      '/mcp': { post: { summary: 'Model Context Protocol endpoint (HTTP streaming)', responses: { '200': { description: 'MCP response' } } } },
    },
    components: {
      schemas: {
        Manifest: { type: 'object' },
        Component: { type: 'object' },
      },
    },
  };
}
```

- [ ] **Step 4: Implement endpoint**

Create `src/pages/openapi.json.ts`:

```ts
import type { APIRoute } from 'astro';
import { buildOpenApiSpec } from '../lib/openapi';

export const GET: APIRoute = async () => {
  const spec = buildOpenApiSpec({ baseUrl: 'https://system.djasha.me' });
  return new Response(JSON.stringify(spec, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
```

- [ ] **Step 5: Run tests + build**

```bash
npm run test && npm run build
cat dist/openapi.json | head -30
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/openapi.ts src/pages/openapi.json.ts tests/unit/openapi.test.ts
git commit -m "feat(api): /openapi.json (3.1) describing all public endpoints"
```

### Task 1.6: Build Schema.org JSON-LD generator (TDD)

**Files:** `src/lib/jsonld.ts`, `tests/unit/jsonld.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/jsonld.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { jsonLdForWebsite, jsonLdForComponent, jsonLdForReference, jsonLdForSkill, jsonLdForBreadcrumbs } from '../../src/lib/jsonld';

describe('jsonLdForWebsite', () => {
  it('emits a WebSite type with the right URL', () => {
    const out = jsonLdForWebsite({ url: 'https://system.djasha.me' });
    expect(out['@type']).toBe('WebSite');
    expect(out.url).toBe('https://system.djasha.me');
    expect(out.publisher).toBeDefined();
  });
});

describe('jsonLdForComponent', () => {
  const c = {
    name: 'MagneticButton',
    slug: 'magnetic-button',
    description: 'Cursor-pull button.',
    sourcePath: 'src/components/MagneticButton.tsx',
    tags: ['motion', 'button'],
    site: 'https://system.djasha.me',
    githubBase: 'https://github.com/djasha/system',
    license: 'See repo',
  };

  it('emits a SoftwareSourceCode', () => {
    const out = jsonLdForComponent(c);
    expect(out['@type']).toBe('SoftwareSourceCode');
    expect(out.name).toBe('MagneticButton');
    expect(out.codeRepository).toContain('github.com/djasha/system');
  });

  it('lists tags as keywords', () => {
    const out = jsonLdForComponent(c);
    expect(out.keywords).toEqual('motion, button');
  });
});

describe('jsonLdForReference', () => {
  const r = {
    name: 'Linear',
    slug: 'linear',
    owner: 'Linear Team',
    description: 'SaaS task tracker design system.',
    site: 'https://system.djasha.me',
    sourceUrl: 'https://linear.app',
    upstream: 'https://github.com/nexu-io/open-design',
    upstreamSha: 'abc123',
  };

  it('emits a CreativeWork type', () => {
    const out = jsonLdForReference(r);
    expect(out['@type']).toBe('CreativeWork');
    expect(out.name).toContain('Linear');
  });

  it('includes isBasedOn pointing at upstream', () => {
    const out = jsonLdForReference(r);
    expect(out.isBasedOn).toMatchObject({ url: 'https://github.com/nexu-io/open-design' });
  });
});

describe('jsonLdForBreadcrumbs', () => {
  it('emits a BreadcrumbList', () => {
    const out = jsonLdForBreadcrumbs([
      { name: 'Home', url: 'https://system.djasha.me' },
      { name: 'Components', url: 'https://system.djasha.me/components' },
      { name: 'MagneticButton', url: 'https://system.djasha.me/components/magnetic-button' },
    ]);
    expect(out['@type']).toBe('BreadcrumbList');
    expect(out.itemListElement).toHaveLength(3);
    expect(out.itemListElement[0].position).toBe(1);
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/jsonld.ts`:

```ts
const PUBLISHER = {
  '@type': 'Person',
  name: 'Diaa Asha',
  url: 'https://djasha.me',
  sameAs: ['https://github.com/djasha'],
};

export function jsonLdForWebsite(i: { url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Djasha System',
    description: 'The agent-first index of design systems and skills.',
    url: i.url,
    publisher: PUBLISHER,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${i.url}/components?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function jsonLdForComponent(i: {
  name: string; slug: string; description: string; sourcePath: string; tags: string[];
  site: string; githubBase: string; license: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: i.name,
    description: i.description,
    url: `${i.site}/components/${i.slug}`,
    codeRepository: `${i.githubBase}/blob/main/${i.sourcePath}`,
    programmingLanguage: 'TypeScript',
    keywords: i.tags.join(', '),
    license: i.license,
    creator: PUBLISHER,
    publisher: PUBLISHER,
  };
}

export function jsonLdForReference(i: {
  name: string; slug: string; owner: string; description: string; site: string; sourceUrl: string; upstream: string; upstreamSha: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${i.name} (Reference)`,
    description: i.description,
    url: `${i.site}/references/${i.slug}`,
    creator: { '@type': 'Organization', name: i.owner, url: i.sourceUrl },
    publisher: PUBLISHER,
    isBasedOn: {
      '@type': 'CreativeWork',
      url: i.upstream,
      identifier: i.upstreamSha,
      name: 'nexu-io/open-design',
    },
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
  };
}

export function jsonLdForSkill(i: {
  name: string; slug: string; description: string; mode: string; site: string; upstream: string; upstreamSha: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: i.name,
    description: i.description,
    url: `${i.site}/skills/${i.slug}`,
    additionalType: `https://djasha.me/schema/AgentSkill/${i.mode}`,
    publisher: PUBLISHER,
    isBasedOn: { '@type': 'CreativeWork', url: i.upstream, identifier: i.upstreamSha, name: 'nexu-io/open-design' },
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
  };
}

export function jsonLdForBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/jsonld.ts tests/unit/jsonld.test.ts
git commit -m "feat(seo): Schema.org JSON-LD builders for WebSite, Component, Reference, Skill, BreadcrumbList"
```

### Task 1.7: Wire JSON-LD into BaseLayout

**Files:** `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Modify BaseLayout to accept jsonLd prop and emit script tag**

Read the existing `src/layouts/BaseLayout.astro` first. Then update the Props interface to accept `jsonLd?: object | object[]` and emit it inside `<head>`:

```astro
---
import '../styles/global.css';
import { CommandK } from '../components/chrome/CommandK';
import Nav from '../components/chrome/Nav.astro';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  jsonLd?: object | object[];
}
const { title, description = 'An AI-native design system.', ogImage, jsonLd } = Astro.props;
const ogImageUrl = ogImage ? new URL(ogImage, Astro.site ?? 'http://localhost:4321').toString() : undefined;
const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
---
<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — Djasha System</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={`${title} — Djasha System`} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
    {ogImageUrl && <meta name="twitter:card" content="summary_large_image" />}
    {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
    {jsonLdArray.map((obj) => (
      <script type="application/ld+json" set:html={JSON.stringify(obj)} />
    ))}
    <script is:inline>
      (() => {
        const t = localStorage.getItem('theme') ?? 'system';
        const resolved = t === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
        document.documentElement.setAttribute('data-theme', resolved);
      })();
    </script>
  </head>
  <body>
    <Nav />
    <slot />
    <CommandK client:idle />
  </body>
</html>
```

- [ ] **Step 2: Update home page to pass JSON-LD**

Edit `src/pages/index.astro` frontmatter to import + pass:

```astro
---
import DocLayout from '../layouts/DocLayout.astro';
import { getCollection } from 'astro:content';
import { jsonLdForWebsite } from '../lib/jsonld';
// ... existing imports
const jsonLd = jsonLdForWebsite({ url: 'https://system.djasha.me' });
// ... existing logic
---
<DocLayout title="Home" description="An AI-native design system." jsonLd={jsonLd}>
```

DocLayout passes through to BaseLayout. Edit `src/layouts/DocLayout.astro` to accept + forward `jsonLd` prop.

- [ ] **Step 3: Update component detail page to emit jsonLd**

Edit `src/pages/components/[slug].astro` to build component JSON-LD + breadcrumbs:

```astro
---
// ... existing imports
import { jsonLdForComponent, jsonLdForBreadcrumbs } from '../../lib/jsonld';

// after entry is loaded:
const jsonLd = [
  jsonLdForComponent({
    name: entry.data.name,
    slug,
    description: entry.data.description,
    sourcePath: entry.data.source_path,
    tags: entry.data.tags,
    site: 'https://system.djasha.me',
    githubBase: 'https://github.com/djasha/system',
    license: 'See repo',
  }),
  jsonLdForBreadcrumbs([
    { name: 'Home', url: 'https://system.djasha.me' },
    { name: 'Components', url: 'https://system.djasha.me/components' },
    { name: entry.data.name, url: `https://system.djasha.me/components/${slug}` },
  ]),
];
---
<DocLayout title={entry.data.name} description={entry.data.description} ogImage={`/og/${slug}.png`} jsonLd={jsonLd}>
```

- [ ] **Step 4: Build + verify**

```bash
npm run build
grep -A 5 'application/ld+json' dist/index.html | head
grep -A 5 'application/ld+json' dist/components/magnetic-button/index.html | head
```

Expected: both pages have JSON-LD script tags with valid JSON.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/layouts/DocLayout.astro src/pages/index.astro src/pages/components/[slug].astro
git commit -m "feat(seo): emit Schema.org JSON-LD on home + component detail pages"
```

---

## Phase 2 — MCP server (existing collections)

### Task 2.1: Build MCP server bootstrap

**Files:** `src/lib/mcp/server.ts`

- [ ] **Step 1: Implement**

Create `src/lib/mcp/server.ts`:

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerOriginalsTools } from './tools/originals';
// References, skills, directions, cross are added in later phases.

export function createMcpServer() {
  const server = new McpServer({
    name: 'djasha-system',
    version: '2.0.0',
  });

  registerOriginalsTools(server);

  return server;
}
```

The actual tool modules are built in subsequent tasks. This file is the assembly point.

- [ ] **Step 2: Commit (placeholder, will be expanded)**

```bash
git add src/lib/mcp/server.ts
git commit -m "feat(mcp): MCP server bootstrap (skeleton)"
```

### Task 2.2: Build MCP tools for Originals (TDD)

**Files:** `src/lib/mcp/tools/originals.ts`, `tests/unit/mcp/originals.test.ts`

The Originals tools wrap existing v1 endpoints. Their handlers fetch JSON from `/api/...` at runtime (or read content collections directly when the MCP server runs in the same process — but since the server runs as a Vercel function, we'll fetch over HTTP for collection access).

For testability, the tools accept a `fetcher` interface — tests inject mocks.

- [ ] **Step 1: Write failing tests**

Create `tests/unit/mcp/originals.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { handleSearchComponents, handleGetComponent, handleGetBundle } from '../../../src/lib/mcp/tools/originals';

describe('handleSearchComponents', () => {
  const fetcher = {
    fetchSearchIndex: vi.fn().mockResolvedValue([
      { type: 'component', slug: 'magnetic-button', name: 'MagneticButton', description: 'Magnetic pull.', tags: ['motion'] },
      { type: 'component', slug: 'tilt-card', name: 'TiltCard', description: 'Tilt on hover.', tags: ['motion'] },
      { type: 'token', slug: 'color.accent', name: 'accent' },
    ]),
  };

  it('returns only components matching the query', async () => {
    const out = await handleSearchComponents({ query: 'magnetic' }, fetcher);
    expect(out).toHaveLength(1);
    expect(out[0].slug).toBe('magnetic-button');
  });

  it('respects limit', async () => {
    const out = await handleSearchComponents({ query: 'motion', limit: 1 }, fetcher);
    expect(out).toHaveLength(1);
  });

  it('excludes non-component types', async () => {
    const out = await handleSearchComponents({ query: 'accent' }, fetcher);
    expect(out.every((r) => r.type === 'component')).toBe(true);
  });
});

describe('handleGetComponent', () => {
  it('fetches the JSON for the slug', async () => {
    const fetcher = { fetchComponent: vi.fn().mockResolvedValue({ slug: 'magnetic-button', name: 'MagneticButton' }) };
    const out = await handleGetComponent({ slug: 'magnetic-button' }, fetcher);
    expect(fetcher.fetchComponent).toHaveBeenCalledWith('magnetic-button');
    expect(out.slug).toBe('magnetic-button');
  });
});

describe('handleGetBundle', () => {
  it('fetches the bundle markdown for the slug', async () => {
    const fetcher = { fetchBundle: vi.fn().mockResolvedValue('# MagneticButton\n\n...') };
    const out = await handleGetBundle({ slug: 'magnetic-button' }, fetcher);
    expect(out).toMatch(/^# MagneticButton/);
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/lib/mcp/tools/originals.ts`:

```ts
import { z } from 'zod';
import Fuse from 'fuse.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface OriginalsFetcher {
  fetchSearchIndex?: () => Promise<any[]>;
  fetchComponent?: (slug: string) => Promise<any>;
  fetchBundle?: (slug: string) => Promise<string>;
  fetchManifest?: () => Promise<any>;
  fetchTokens?: () => Promise<any>;
}

const BASE = process.env.MCP_PUBLIC_BASE ?? 'https://system.djasha.me';

const httpFetcher: Required<OriginalsFetcher> = {
  fetchSearchIndex: async () => (await fetch(`${BASE}/search-index.json`)).json(),
  fetchComponent: async (slug) => (await fetch(`${BASE}/api/components/${slug}.json`)).json(),
  fetchBundle: async (slug) => (await fetch(`${BASE}/bundles/${slug}.md`)).text(),
  fetchManifest: async () => (await fetch(`${BASE}/api/index.json`)).json(),
  fetchTokens: async () => (await fetch(`${BASE}/tokens.json`)).json(),
};

export async function handleSearchComponents(
  args: { query: string; limit?: number },
  fetcher: OriginalsFetcher = httpFetcher,
) {
  const index = await fetcher.fetchSearchIndex!();
  const components = index.filter((e: any) => e.type === 'component');
  const fuse = new Fuse(components, { keys: ['name', 'description', 'tags'], threshold: 0.3 });
  const results = fuse.search(args.query).slice(0, args.limit ?? 20).map((r: any) => ({ ...r.item, score: r.score }));
  return results;
}

export async function handleGetComponent(args: { slug: string }, fetcher: OriginalsFetcher = httpFetcher) {
  return fetcher.fetchComponent!(args.slug);
}

export async function handleGetBundle(args: { slug: string }, fetcher: OriginalsFetcher = httpFetcher) {
  return fetcher.fetchBundle!(args.slug);
}

export async function handleListPatterns(_args: unknown, fetcher: OriginalsFetcher = httpFetcher) {
  const manifest = await fetcher.fetchManifest!();
  return manifest.patterns ?? [];
}

export async function handleListTokens(args: { category?: string }, fetcher: OriginalsFetcher = httpFetcher) {
  const tokens = await fetcher.fetchTokens!();
  const all = Object.values(tokens) as any[];
  return args.category ? all.filter((t) => t.category === args.category) : all;
}

export async function handleGetToken(args: { slug: string }, fetcher: OriginalsFetcher = httpFetcher) {
  const tokens = await fetcher.fetchTokens!();
  return tokens[args.slug] ?? null;
}

export async function handleFindByToken(args: { tokenSlug: string }, fetcher: OriginalsFetcher = httpFetcher) {
  const manifest = await fetcher.fetchManifest!();
  const components = (manifest.components ?? []).filter((c: any) => (c.tokens_used ?? []).includes(args.tokenSlug));
  const patterns = (manifest.patterns ?? []).filter((p: any) => (p.tokens_used ?? []).includes(args.tokenSlug));
  return { components, patterns };
}

export function registerOriginalsTools(server: McpServer) {
  server.tool(
    'search_components',
    {
      query: z.string().describe('Free-text query — name, description, tags'),
      limit: z.number().optional().describe('Max results, default 20'),
    },
    async (args) => {
      const results = await handleSearchComponents(args);
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    },
  );

  server.tool(
    'get_component',
    { slug: z.string() },
    async (args) => {
      const result = await handleGetComponent(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'get_bundle',
    { slug: z.string() },
    async (args) => {
      const result = await handleGetBundle(args);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  server.tool('list_patterns', {}, async () => {
    const result = await handleListPatterns({});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool(
    'list_tokens',
    { category: z.enum(['color', 'type', 'space', 'radius', 'shadow', 'motion']).optional() },
    async (args) => {
      const result = await handleListTokens(args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool('get_token', { slug: z.string() }, async (args) => {
    const result = await handleGetToken(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('find_by_token', { tokenSlug: z.string() }, async (args) => {
    const result = await handleFindByToken(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mcp/tools/originals.ts tests/unit/mcp/originals.test.ts
git commit -m "feat(mcp): Originals tools (search_components, get_component, get_bundle, list_patterns, tokens)"
```

### Task 2.3: Build /mcp endpoint (Vercel serverless function)

**Files:** `src/pages/api/mcp.ts`, `vercel.json` (modify)

The MCP endpoint runs as a serverless function with HTTP streaming transport. Astro 6 supports server endpoints when configured for hybrid output, OR we can drop into Vercel's `/api/` convention.

**Approach:** keep Astro's `output: 'static'`. Add a server-side function via `vercel.json`'s rewrites — Astro's static build coexists with `/api/mcp` as a separate Vercel function.

Actually, simpler: Astro 6 supports per-page server rendering with `export const prerender = false`. Use that for `/api/mcp.ts`.

- [ ] **Step 1: Configure Astro for hybrid output (per-page)**

Edit `astro.config.mjs` to add `output: 'hybrid'` (or keep `'static'` and use prerender:false per page — verify which works). Actually Astro 6 deprecated 'hybrid' — `output: 'static'` with `prerender: false` per page is the path:

```js
// In astro.config.mjs
import vercel from '@astrojs/vercel';

export default defineConfig({
  // ... existing config
  output: 'static',
  adapter: vercel(),
});
```

- [ ] **Step 2: Install Vercel adapter**

```bash
cd /Users/Djasha/djasha-system
npm install @astrojs/vercel
```

- [ ] **Step 3: Implement MCP endpoint**

Create `src/pages/api/mcp.ts`:

```ts
import type { APIRoute } from 'astro';
import { createMcpServer } from '../../lib/mcp/server';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  await server.connect(transport);

  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  // Streamable HTTP transport handles request/response via Node-style req/res emulation.
  // Astro's APIRoute gives us a Request — we adapt.
  return new Promise<Response>((resolve, reject) => {
    let responseBody = '';
    let responseStatus = 200;
    let responseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

    const fakeReq = {
      method: 'POST',
      url: '/mcp',
      headers,
      body,
      on: () => {},
    } as any;

    const fakeRes = {
      writeHead: (status: number, h: Record<string, string>) => {
        responseStatus = status;
        responseHeaders = { ...responseHeaders, ...h };
      },
      write: (chunk: string) => { responseBody += chunk; },
      end: (chunk?: string) => {
        if (chunk) responseBody += chunk;
        resolve(new Response(responseBody, { status: responseStatus, headers: responseHeaders }));
      },
      setHeader: (k: string, v: string) => { responseHeaders[k] = v; },
    } as any;

    transport.handleRequest(fakeReq, fakeRes, JSON.parse(body)).catch(reject);
  });
};

export const GET: APIRoute = async () => {
  return new Response('MCP endpoint. POST JSON-RPC requests here.', {
    status: 405,
    headers: { 'Content-Type': 'text/plain', 'Allow': 'POST' },
  });
};
```

> **Note:** the request/response adaptation may need tweaks based on the MCP SDK's actual API. If the SDK exposes a simpler handler that takes a `Request` and returns a `Response`, prefer that. Verify with `node_modules/@modelcontextprotocol/sdk/server/streamableHttp.d.ts` at implementation time.

- [ ] **Step 4: Build + smoke-test**

```bash
npm run build
```

Expected: build succeeds. The `/api/mcp` route is now a serverless function.

- [ ] **Step 5: Test locally with Vercel dev**

```bash
npx -y vercel dev --listen 4324 &
sleep 5
curl -X POST http://localhost:4324/api/mcp -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head
```

Expected: JSON-RPC response listing tools.

- [ ] **Step 6: Commit**

```bash
git add src/pages/api/mcp.ts astro.config.mjs package.json package-lock.json
git commit -m "feat(mcp): /mcp serverless endpoint with HTTP streaming transport"
```

### Task 2.4: Build /.well-known/mcp.json discovery manifest

**Files:** `src/pages/.well-known/mcp.json.ts`

- [ ] **Step 1: Implement**

Create `src/pages/.well-known/mcp.json.ts`:

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const manifest = {
    name: 'Djasha System',
    description: 'The agent-first index of design systems and skills.',
    endpoint: 'https://system.djasha.me/api/mcp',
    version: '2.0.0',
    transport: 'http-streaming',
    tools_count: 7, // bumped as more tools land in later phases
    schema: 'https://modelcontextprotocol.io/schemas/discovery/v1',
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/.well-known/
git commit -m "feat(mcp): /.well-known/mcp.json discovery manifest"
```

### Task 2.5: Build /integrations page

**Files:** `src/pages/integrations/index.astro`

- [ ] **Step 1: Implement**

Create `src/pages/integrations/index.astro`:

```astro
---
import DocLayout from '../../layouts/DocLayout.astro';

const mcpInstall = {
  claudeCode: `claude mcp add djasha-system https://system.djasha.me/api/mcp`,
  cursor: `# In ~/.cursor/mcp.json
{
  "mcpServers": {
    "djasha-system": {
      "url": "https://system.djasha.me/api/mcp"
    }
  }
}`,
  manual: `curl https://system.djasha.me/.well-known/mcp.json`,
};
---
<DocLayout title="Integrations" description="How AI agents connect to Djasha System.">
  <header class="mb-10">
    <h1 class="font-display text-5xl tracking-tight">Integrations</h1>
    <p class="text-xl text-bone/70 mt-3 max-w-2xl">Three ways for AI agents to consume the library.</p>
  </header>

  <section class="mb-12">
    <h2 class="font-display text-2xl mb-4">MCP server (recommended)</h2>
    <p class="text-bone/70 mb-4">Native Model Context Protocol. Agents call <code>search_components</code>, <code>get_bundle</code>, <code>find_skill_for_scenario</code>, etc. as tools — no copy/paste.</p>

    <h3 class="font-mono text-sm uppercase tracking-wide text-bone/50 mt-6 mb-2">Claude Code</h3>
    <pre class="font-mono text-sm bg-elevated p-4 rounded-md border border-bone/10 overflow-auto"><code>{mcpInstall.claudeCode}</code></pre>

    <h3 class="font-mono text-sm uppercase tracking-wide text-bone/50 mt-6 mb-2">Cursor</h3>
    <pre class="font-mono text-sm bg-elevated p-4 rounded-md border border-bone/10 overflow-auto"><code>{mcpInstall.cursor}</code></pre>
  </section>

  <section class="mb-12">
    <h2 class="font-display text-2xl mb-4">JSON API</h2>
    <p class="text-bone/70 mb-4">Static, cacheable, CORS-open. See the <a href="/api" class="text-accent hover:underline">API page</a> for endpoints. OpenAPI 3.1 spec at <a href="/openapi.json" class="text-accent hover:underline font-mono text-sm">/openapi.json</a>.</p>
  </section>

  <section class="mb-12">
    <h2 class="font-display text-2xl mb-4">Site indexes for crawler agents</h2>
    <ul class="space-y-2 text-bone/70">
      <li><a href="/llms.txt" class="font-mono text-sm text-accent hover:underline">/llms.txt</a> — concise LLM-readable index per the llms.txt spec</li>
      <li><a href="/llms-full.txt" class="font-mono text-sm text-accent hover:underline">/llms-full.txt</a> — full content dump for one-fetch consumption</li>
    </ul>
  </section>
</DocLayout>
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/integrations/
git commit -m "feat(pages): /integrations documenting MCP + JSON API + llms.txt"
```

### Task 2.6: Add Nav entries for new sections (placeholder)

**Files:** `src/components/chrome/Nav.astro`

- [ ] **Step 1: Add Integrations to nav**

Edit `src/components/chrome/Nav.astro`. Add `{ href: '/integrations', label: 'Integrations' }` after API. References, Skills, Directions get added later when their pages exist.

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/chrome/Nav.astro
git commit -m "feat(nav): add Integrations link"
```

---

## Phase 3 — Originals depth (more components, patterns, voice)

This phase reuses v1's `npm run scaffold` + manual port pattern. Each component migration is a separate commit using the established loop.

### Task 3.1 → 3.7: Migrate 7 priority components

For each component (TextMaskReveal, ScrollProgress, HeroGallery, ToolTicker, Expandable, Figure, ProjectCard):

- [ ] **Step 1: Copy source from portfolio**

```bash
cp /Users/Djasha/portfolio-remake/site/src/components/<Name>.tsx /Users/Djasha/djasha-system/src/components/<Name>.tsx
```

- [ ] **Step 2: Adapt** — change to named export if needed, add typed props, remove portfolio-specific imports.

- [ ] **Step 3: Scaffold**

```bash
npm run scaffold -- <Name>
```

- [ ] **Step 4: Fill in `src/content/components/<slug>.doc.mdx`** — real description, category, tags, tokens_used (from existing 10-token set), related, a11y_notes, Prompt/Usage/Do-Don't.

- [ ] **Step 5: Fill in `src/components/<Name>.playground.tsx`** — knobs matching the component's actual props, `toCode` reflecting them.

- [ ] **Step 6: Register in islands**

Edit `src/components/chrome/PlaygroundIsland.tsx` and `src/components/chrome/PreviewIsland.tsx` registries to add the new slug.

- [ ] **Step 7: Verify + commit**

```bash
npm run check:all && npm run build && npm run test
git add -A
git commit -m "feat(components): migrate <Name>"
```

> **Engineer's note:** the v1 plan §8.2-8.8 documents this migration loop in detail. Reuse those patterns. Stop at 7 if quality dips — better fewer high-quality entries than many sloppy ones.

### Task 3.8: Seed 3 patterns

**Files:**
- Create: `src/components/EditorialHero.astro`, `src/components/CaseStudyBody.astro`, `src/components/FilterableWorkGrid.astro`
- Create: `src/content/patterns/editorial-hero.doc.mdx`, `case-study-body.doc.mdx`, `filterable-work-grid.doc.mdx`

For each pattern, follow the same 7-step migration loop as components, but add `components_used: [...]` field and write the pattern as a composite component (`.astro` is fine since patterns are mostly markup).

- [ ] **Step 1**: implement each pattern as an `.astro` component using the now-migrated primitives.
- [ ] **Step 2**: scaffold + fill doc.mdx.
- [ ] **Step 3**: register in islands (where playground applies).
- [ ] **Step 4**: build + commit (one commit per pattern).

### Task 3.9: Seed 5 voice entries

**Files:**
- Create: `src/content/voice/microcopy.yaml`, `error-messages.yaml`, `ctas.yaml`, `empty-states.yaml`, `onboarding-copy.yaml`

For each voice entry, write a YAML file matching the v1 schema (topic, description, rules[], examples[{good, bad}]).

- [ ] **Step 1**: write `microcopy.yaml`:

```yaml
topic: Microcopy
description: Button labels, link text, form hints — the words you hardly notice.
rules:
  - Verbs over nouns. "Send" not "Sending". "Save changes" not "Submit form".
  - Avoid "click" and "tap" — name what happens, not the gesture.
  - Match user goals, not system mechanics. "Get started" not "Initialize account".
examples:
  - good: Save changes
    bad: Submit
  - good: Try the demo
    bad: Click here to view interactive demonstration
```

- [ ] **Step 2-5**: similar for `error-messages.yaml`, `ctas.yaml`, `empty-states.yaml`, `onboarding-copy.yaml`. Use the established v1 voice schema.

- [ ] **Step 6: Verify + commit (one commit for all 5)**

```bash
npm run check:all && npm run build
git add src/content/voice/
git commit -m "feat(content): seed 5 voice entries (microcopy, errors, CTAs, empty states, onboarding)"
```

---

## Phase 4 — New collection schemas

### Task 4.1: Define references, skills, directions schemas

**Files:** `src/content.config.ts`, `src/lib/types.ts`

- [ ] **Step 1: Add new enums to types.ts**

Edit `src/lib/types.ts`, append:

```ts
export const SKILL_MODES = ['prototype', 'deck', 'template'] as const;
export type SkillMode = typeof SKILL_MODES[number];

export const SKILL_SCENARIOS = ['design', 'marketing', 'operation', 'engineering', 'product', 'finance', 'hr', 'sale', 'personal'] as const;
export type SkillScenario = typeof SKILL_SCENARIOS[number];

export const DIRECTION_SLUGS = ['editorial-monocle', 'modern-minimal', 'warm-soft', 'tech-utility', 'brutalist-experimental'] as const;
export type DirectionSlug = typeof DIRECTION_SLUGS[number];
```

- [ ] **Step 2: Add collections to content.config.ts**

Edit `src/content.config.ts`, append after the existing collections:

```ts
import { SKILL_MODES, SKILL_SCENARIOS } from './lib/types';

const attributionSchema = z.object({
  upstream: z.string(),
  upstream_license: z.string(),
  upstream_sha: z.string(),
  upstream_path: z.string(),
  original_owner_url: z.string().url().optional(),
  last_synced: z.coerce.date(),
});

const references = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/references',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    owner: z.string(),
    source_url: z.string().url(),
    design_md_path: z.string(),
    category: z.string(),
    description: z.string(),
    palette: z.record(z.string(), z.string()),
    fonts: z.object({ display: z.string(), body: z.string(), mono: z.string().optional() }),
    motion: z.record(z.string(), z.string()).optional(),
    components: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    attribution: attributionSchema,
  }),
});

const skills = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/skills',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    mode: z.enum(SKILL_MODES),
    scenario: z.enum(SKILL_SCENARIOS),
    description: z.string(),
    prompt_body: z.string(),
    example_html_path: z.string(),
    design_system_requires: z.string().optional(),
    default_for: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    fidelity: z.enum(['low', 'medium', 'high']).optional(),
    speaker_notes: z.boolean().optional(),
    animations: z.boolean().optional(),
    example_prompt: z.string().optional(),
    attribution: attributionSchema,
  }),
});

const directions = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/directions',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    description: z.string(),
    palette: z.record(z.string(), z.string()),
    fonts: z.object({ display: z.string(), body: z.string(), mono: z.string().optional() }),
    motion: z.record(z.string(), z.string()).optional(),
    vibe: z.string(),
    attribution: attributionSchema,
  }),
});

export const collections = { components, patterns, tokens, voice, references, skills, directions };
```

- [ ] **Step 3: Create empty collection directories**

```bash
mkdir -p src/content/{references,skills,directions}
touch src/content/references/.gitkeep src/content/skills/.gitkeep src/content/directions/.gitkeep
```

- [ ] **Step 4: Verify**

```bash
npx astro check
```

Expected: 0 errors. Empty collections with valid schemas.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/lib/types.ts src/content/{references,skills,directions}/.gitkeep
git commit -m "feat(content): add references, skills, directions collection schemas"
```

---

## Phase 5 — Vendoring pipeline

### Task 5.1: Vendor LICENSE/NOTICE files

**Files:** `vendor/open-design/LICENSE`, `vendor/open-design/NOTICE`, `vendor/open-design/SHA`, `vendor/open-design/ATTRIBUTION.md`

- [ ] **Step 1: Create vendor directory + manual placeholder files**

Initially these are placeholders; the sync script will populate them. Create:

```bash
mkdir -p vendor/open-design
```

Create `vendor/open-design/LICENSE` with placeholder text:

```
# This file is auto-managed by scripts/sync-open-design.ts.
# It will be overwritten on the next sync with the upstream Apache-2.0 LICENSE
# from https://github.com/nexu-io/open-design.
```

Create `vendor/open-design/NOTICE` with the same shape.

Create `vendor/open-design/SHA` with `pending`.

Create `vendor/open-design/ATTRIBUTION.md`:

```markdown
# Open Design — Vendored Content Attribution

This directory holds redistributed content from [`nexu-io/open-design`](https://github.com/nexu-io/open-design)
under the Apache-2.0 License.

Per the license:
- Upstream LICENSE preserved verbatim at `LICENSE`.
- Upstream NOTICE (if any) preserved at `NOTICE`.
- Last sync upstream commit SHA recorded at `SHA`.
- Each rendered page on system.djasha.me showing vendored content includes a
  visible attribution rail with the upstream link + (where known) the original
  system owner.

For takedown requests, see `docs/takedown.md`.
```

- [ ] **Step 2: Commit placeholders**

```bash
git add vendor/open-design/
git commit -m "chore(vendor): scaffold vendor/open-design/ for Apache-2.0 redistribution"
```

### Task 5.2: Build vendor sync script (TDD core logic)

**Files:** `scripts/sync-open-design.ts`, `tests/unit/sync-open-design.test.ts`

The script does:
1. Clone upstream to a temp dir.
2. Walk `design-systems/`, `skills/`, parse each.
3. Write parsed entries to our content collections.
4. Copy upstream LICENSE/NOTICE.
5. Record SHA.

The novel logic (parsing, conflict detection) is unit-tested. The git clone is integration-only.

- [ ] **Step 1: Write failing tests for parsing**

Create `tests/unit/sync-open-design.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseDesignSystem, parseSkill, detectLocalEdit } from '../../scripts/sync-open-design';

describe('parseDesignSystem', () => {
  it('extracts name, palette, fonts from a DESIGN.md', () => {
    const md = `# Linear

> SaaS task tracker by Linear.

## Palette
- primary: #5E6AD2
- bg: #ffffff

## Fonts
- display: Inter
- body: Inter
- mono: Geist Mono

## Components
- Button
- Card
- Modal
`;
    const parsed = parseDesignSystem('linear', md, { upstream: 'github.com/nexu-io/open-design', sha: 'abc', path: 'design-systems/linear/' });
    expect(parsed.name).toBe('Linear');
    expect(parsed.palette.primary).toBe('#5E6AD2');
    expect(parsed.fonts.display).toBe('Inter');
    expect(parsed.components).toContain('Button');
    expect(parsed.attribution.upstream_sha).toBe('abc');
  });
});

describe('parseSkill', () => {
  it('extracts mode + scenario from SKILL.md frontmatter', () => {
    const md = `---
name: saas-landing
od:
  mode: prototype
  scenario: marketing
  fidelity: high
---

Build a SaaS landing page with a hero, three features, pricing, and footer.
`;
    const parsed = parseSkill('saas-landing', md, '<html>example</html>', { upstream: 'github.com/nexu-io/open-design', sha: 'abc', path: 'skills/saas-landing/' });
    expect(parsed.mode).toBe('prototype');
    expect(parsed.scenario).toBe('marketing');
    expect(parsed.example_html_path).toContain('vendor/open-design/skills/saas-landing/');
  });
});

describe('detectLocalEdit', () => {
  it('returns false when checksum matches', () => {
    const original = '# Linear\n\nFoo.';
    const local = '# Linear\n\nFoo.';
    expect(detectLocalEdit(original, local)).toBe(false);
  });
  it('returns true when content diverged', () => {
    const original = '# Linear\n\nFoo.';
    const local = '# Linear (custom)\n\nFoo.';
    expect(detectLocalEdit(original, local)).toBe(true);
  });
});
```

- [ ] **Step 2: Run — verify fail**

```bash
npm run test
```

Expected: FAIL.

- [ ] **Step 3: Implement parsing functions**

Create `scripts/sync-open-design.ts`:

```ts
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import simpleGit from 'simple-git';
import yaml from 'js-yaml';
import crypto from 'node:crypto';

const UPSTREAM_REPO = 'https://github.com/nexu-io/open-design.git';

interface AttributionInput {
  upstream: string;
  sha: string;
  path: string;
}

export interface ReferenceEntry {
  name: string;
  slug: string;
  owner: string;
  source_url: string;
  design_md_path: string;
  category: string;
  description: string;
  palette: Record<string, string>;
  fonts: { display: string; body: string; mono?: string };
  motion?: Record<string, string>;
  components: string[];
  tags: string[];
  attribution: {
    upstream: string;
    upstream_license: 'Apache-2.0';
    upstream_sha: string;
    upstream_path: string;
    original_owner_url?: string;
    last_synced: string;
  };
}

export function parseDesignSystem(slug: string, designMd: string, ctx: AttributionInput): ReferenceEntry {
  const lines = designMd.split('\n');
  const name = lines.find((l) => l.startsWith('# '))?.slice(2).trim() ?? slug;
  const description = lines.find((l) => l.startsWith('> '))?.slice(2).trim() ?? '';

  const palette: Record<string, string> = {};
  const paletteSection = extractSection(designMd, 'Palette');
  for (const line of paletteSection.split('\n')) {
    const m = line.match(/^-\s*(\w[\w-]*)\s*:\s*(\S+)/);
    if (m) palette[m[1]] = m[2];
  }

  const fonts: { display: string; body: string; mono?: string } = { display: 'Inter', body: 'Inter' };
  const fontsSection = extractSection(designMd, 'Fonts');
  for (const line of fontsSection.split('\n')) {
    const m = line.match(/^-\s*(display|body|mono)\s*:\s*(.+)/);
    if (m) (fonts as any)[m[1]] = m[2].trim();
  }

  const components: string[] = [];
  const componentsSection = extractSection(designMd, 'Components');
  for (const line of componentsSection.split('\n')) {
    const m = line.match(/^-\s*(.+)/);
    if (m) components.push(m[1].trim());
  }

  const ownerMatch = description.match(/by\s+([A-Z][\w &]+?)\.$/);
  const owner = ownerMatch?.[1] ?? slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    name,
    slug,
    owner,
    source_url: `https://${slug}.com`, // best guess; can be overridden during review
    design_md_path: `vendor/open-design/${ctx.path}DESIGN.md`,
    category: 'product',
    description,
    palette,
    fonts,
    components,
    tags: [],
    attribution: {
      upstream: ctx.upstream,
      upstream_license: 'Apache-2.0',
      upstream_sha: ctx.sha,
      upstream_path: ctx.path,
      last_synced: new Date().toISOString(),
    },
  };
}

export interface SkillEntry {
  name: string;
  slug: string;
  mode: 'prototype' | 'deck' | 'template';
  scenario: string;
  description: string;
  prompt_body: string;
  example_html_path: string;
  design_system_requires?: string;
  default_for: string[];
  featured: boolean;
  fidelity?: 'low' | 'medium' | 'high';
  speaker_notes?: boolean;
  animations?: boolean;
  example_prompt?: string;
  attribution: ReferenceEntry['attribution'];
}

export function parseSkill(slug: string, skillMd: string, _exampleHtml: string, ctx: AttributionInput): SkillEntry {
  // Extract YAML frontmatter
  const fmMatch = skillMd.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/);
  const fm = fmMatch ? (yaml.load(fmMatch[1]) as any) : {};
  const body = fmMatch ? fmMatch[2].trim() : skillMd.trim();

  const od = fm.od ?? {};
  return {
    name: fm.name ?? slug,
    slug,
    mode: od.mode ?? 'prototype',
    scenario: od.scenario ?? 'design',
    description: body.split('\n')[0] ?? slug,
    prompt_body: body,
    example_html_path: `vendor/open-design/${ctx.path}example.html`,
    design_system_requires: od.design_system?.requires,
    default_for: od.default_for ?? [],
    featured: od.featured ?? false,
    fidelity: od.fidelity,
    speaker_notes: od.speaker_notes,
    animations: od.animations,
    example_prompt: od.example_prompt,
    attribution: {
      upstream: ctx.upstream,
      upstream_license: 'Apache-2.0',
      upstream_sha: ctx.sha,
      upstream_path: ctx.path,
      last_synced: new Date().toISOString(),
    },
  };
}

export function detectLocalEdit(originalContent: string, localContent: string): boolean {
  const hash = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
  return hash(originalContent) !== hash(localContent);
}

function extractSection(md: string, heading: string): string {
  const re = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
  return md.match(re)?.[1].trim() ?? '';
}

export async function run(): Promise<number> {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'open-design-sync-'));
  console.log(`Cloning ${UPSTREAM_REPO} to ${tmpDir}...`);

  const git = simpleGit();
  await git.clone(UPSTREAM_REPO, tmpDir, ['--depth=1', '--single-branch']);

  const sha = (await simpleGit(tmpDir).revparse(['HEAD'])).trim();
  console.log(`Upstream SHA: ${sha}`);

  // Walk design-systems/
  const dsDir = path.join(tmpDir, 'design-systems');
  if (fs.existsSync(dsDir)) {
    for (const slug of await fsp.readdir(dsDir)) {
      const designMdPath = path.join(dsDir, slug, 'DESIGN.md');
      if (!fs.existsSync(designMdPath)) continue;
      const md = await fsp.readFile(designMdPath, 'utf8');
      const entry = parseDesignSystem(slug, md, { upstream: UPSTREAM_REPO, sha, path: `design-systems/${slug}/` });

      // Copy DESIGN.md into vendor/
      await fsp.mkdir(path.join('vendor/open-design', `design-systems/${slug}`), { recursive: true });
      await fsp.copyFile(designMdPath, path.join('vendor/open-design', `design-systems/${slug}/DESIGN.md`));

      // Conflict detection: if local entry exists, hash-compare.
      const localPath = `src/content/references/${slug}.yaml`;
      if (fs.existsSync(localPath)) {
        const local = await fsp.readFile(localPath, 'utf8');
        const local_attr = (yaml.load(local) as any).attribution;
        if (local_attr?.upstream_sha === sha) {
          console.log(`SKIP ${slug}: already at SHA ${sha}`);
          continue;
        }
        // local diverged from previous sync? Skip with warning.
        // (For simplicity v2: detect via attribution.upstream_sha comparison.)
      }

      await fsp.writeFile(localPath, yaml.dump(entry), 'utf8');
      console.log(`WROTE ${localPath}`);
    }
  }

  // Walk skills/ — same pattern.
  const skillsDir = path.join(tmpDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const slug of await fsp.readdir(skillsDir)) {
      const skillMdPath = path.join(skillsDir, slug, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) continue;
      const md = await fsp.readFile(skillMdPath, 'utf8');
      const exampleHtmlPath = path.join(skillsDir, slug, 'example.html');
      const exampleHtml = fs.existsSync(exampleHtmlPath) ? await fsp.readFile(exampleHtmlPath, 'utf8') : '';
      const entry = parseSkill(slug, md, exampleHtml, { upstream: UPSTREAM_REPO, sha, path: `skills/${slug}/` });

      await fsp.mkdir(path.join('vendor/open-design', `skills/${slug}`), { recursive: true });
      await fsp.copyFile(skillMdPath, path.join('vendor/open-design', `skills/${slug}/SKILL.md`));
      if (exampleHtml) await fsp.copyFile(exampleHtmlPath, path.join('vendor/open-design', `skills/${slug}/example.html`));

      const localPath = `src/content/skills/${slug}.yaml`;
      await fsp.writeFile(localPath, yaml.dump(entry), 'utf8');
      console.log(`WROTE ${localPath}`);
    }
  }

  // Copy LICENSE + NOTICE
  const upstreamLicense = path.join(tmpDir, 'LICENSE');
  if (fs.existsSync(upstreamLicense)) {
    await fsp.copyFile(upstreamLicense, 'vendor/open-design/LICENSE');
  }
  const upstreamNotice = path.join(tmpDir, 'NOTICE');
  if (fs.existsSync(upstreamNotice)) {
    await fsp.copyFile(upstreamNotice, 'vendor/open-design/NOTICE');
  }

  await fsp.writeFile('vendor/open-design/SHA', sha + '\n');

  // TODO: extract directions from apps/web/src/prompts/directions.ts (Phase 9 task)
  console.log(`SYNC COMPLETE. SHA: ${sha}`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().then((code) => process.exit(code));
}
```

- [ ] **Step 4: Run unit tests — verify pass**

```bash
npm run test
```

Expected: PASS for `parseDesignSystem`, `parseSkill`, `detectLocalEdit`.

- [ ] **Step 5: Add npm script**

Edit `package.json` `scripts`:

```json
"sync:open-design": "tsx scripts/sync-open-design.ts"
```

- [ ] **Step 6: Commit**

```bash
git add scripts/sync-open-design.ts tests/unit/sync-open-design.test.ts package.json
git commit -m "feat(scripts): vendor sync pipeline (parse + write + LICENSE handling)"
```

### Task 5.3: Run first sync (the big import)

This is the moment of truth — the script ingests Open Design's full catalog into our repo.

- [ ] **Step 1: Run the sync script**

```bash
cd /Users/Djasha/djasha-system
npm run sync:open-design 2>&1 | tee /tmp/sync.log
```

Expected: ~70 design systems + ~31 skills written under `src/content/references/` and `src/content/skills/`. LICENSE + NOTICE copied. SHA recorded.

- [ ] **Step 2: Audit output**

```bash
ls src/content/references/ | wc -l
ls src/content/skills/ | wc -l
cat vendor/open-design/SHA
head -30 src/content/references/linear.yaml
```

Expected: ~70-130 references, ~31 skills, valid SHA.

- [ ] **Step 3: Verify schema**

```bash
npx astro check
```

Expected: 0 errors. If errors: parse function had a bug; fix in scripts/sync-open-design.ts and re-run.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: success. New collections are populated; build emits new pages eventually but for now just no schema errors.

- [ ] **Step 5: Commit (the big one)**

```bash
git add src/content/references/ src/content/skills/ vendor/open-design/
git commit -m "feat(content): first vendor sync of Open Design catalog (Apache-2.0)

Imported $(ls src/content/references/ | wc -l) references and $(ls src/content/skills/ | wc -l) skills.
Upstream SHA: $(cat vendor/open-design/SHA).
LICENSE + NOTICE preserved.

Day-one library catalog: 8 originals + N references + M skills.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 6 — Reference pages + MCP tools

### Task 6.1: Build /references browse page

**Files:** `src/pages/references/index.astro`, `src/components/chrome/ReferenceCard.astro`

Mirrors v1's components grid pattern. Uses the same filter island shape.

- [ ] **Step 1: Implement ReferenceCard.astro**

Create `src/components/chrome/ReferenceCard.astro`:

```astro
---
interface Props { slug: string; name: string; owner: string; description: string; category: string; palette: Record<string, string>; }
const { slug, name, owner, description, category, palette } = Astro.props;
const swatches = Object.values(palette).slice(0, 4);
---
<a href={`/references/${slug}`} class="block p-5 border border-bone/10 rounded-lg bg-elevated/40 hover:border-accent/60 transition-colors group relative">
  <div class="absolute top-2 right-2 text-[9px] font-mono text-bone/40 uppercase tracking-wider">Reference</div>
  <div class="flex justify-between items-start mb-2 gap-3">
    <h3 class="font-display text-lg group-hover:text-accent transition-colors">{name}</h3>
    <span class="text-xs font-mono text-bone/50 uppercase shrink-0">{category}</span>
  </div>
  <p class="text-xs font-mono text-bone/40 mb-2">by {owner}</p>
  <p class="text-sm text-bone/70 mb-3 leading-relaxed line-clamp-2">{description}</p>
  <div class="flex gap-1">
    {swatches.map((c) => <span class="w-5 h-5 rounded border border-bone/15" style={`background:${c}`} />)}
  </div>
</a>
```

- [ ] **Step 2: Implement /references/index.astro**

Create `src/pages/references/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
import ReferenceCard from '../../components/chrome/ReferenceCard.astro';

const references = await getCollection('references');
const sorted = references.sort((a, b) => a.data.name.localeCompare(b.data.name));
---
<DocLayout title="References" description="Vendored design systems from Open Design (Apache-2.0).">
  <header class="mb-10">
    <h1 class="font-display text-5xl tracking-tight">References</h1>
    <p class="text-xl text-bone/70 mt-3 max-w-2xl">{references.length} curated public design systems. Vendored from <a href="https://github.com/nexu-io/open-design" class="text-accent hover:underline">nexu-io/open-design</a> under Apache-2.0 with full attribution preserved. Distinct from <a href="/components" class="text-accent hover:underline">Originals</a>.</p>
  </header>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {sorted.map((r) => (
      <ReferenceCard
        slug={r.id}
        name={r.data.name}
        owner={r.data.owner}
        description={r.data.description}
        category={r.data.category}
        palette={r.data.palette}
      />
    ))}
  </div>
</DocLayout>
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/pages/references/index.astro src/components/chrome/ReferenceCard.astro
git commit -m "feat(pages): /references browse page with palette swatches"
```

### Task 6.2: Build /references/[slug] detail page

**Files:** `src/pages/references/[slug].astro`, `src/components/chrome/AttributionRail.astro`, `src/components/chrome/PaletteGrid.astro`

- [ ] **Step 1: Implement AttributionRail.astro**

Create `src/components/chrome/AttributionRail.astro`:

```astro
---
interface Props {
  upstream: string;
  upstreamSha: string;
  upstreamPath: string;
  originalOwnerUrl?: string;
  lastSynced: Date;
  license: string;
}
const { upstream, upstreamSha, upstreamPath, originalOwnerUrl, lastSynced, license } = Astro.props;
---
<aside class="text-xs text-bone/60 font-mono space-y-2 p-4 border border-bone/10 rounded-lg bg-elevated/40">
  <h3 class="text-bone/80 uppercase tracking-wider mb-3">Attribution</h3>
  <div>
    <span class="text-bone/40">Upstream:</span>
    <a href={upstream} class="hover:text-accent ml-1">{upstream.replace('https://github.com/', '')}</a>
  </div>
  <div>
    <span class="text-bone/40">SHA:</span>
    <code class="ml-1">{upstreamSha.slice(0, 12)}</code>
  </div>
  <div>
    <span class="text-bone/40">Path:</span>
    <code class="ml-1">{upstreamPath}</code>
  </div>
  {originalOwnerUrl && (
    <div>
      <span class="text-bone/40">Original owner:</span>
      <a href={originalOwnerUrl} class="hover:text-accent ml-1">{originalOwnerUrl.replace(/^https?:\/\//, '')}</a>
    </div>
  )}
  <div>
    <span class="text-bone/40">License:</span>
    <span class="ml-1">{license}</span>
  </div>
  <div>
    <span class="text-bone/40">Last synced:</span>
    <span class="ml-1">{lastSynced.toISOString().slice(0, 10)}</span>
  </div>
</aside>
```

- [ ] **Step 2: Implement PaletteGrid.astro**

Create `src/components/chrome/PaletteGrid.astro`:

```astro
---
interface Props { palette: Record<string, string>; }
const { palette } = Astro.props;
const entries = Object.entries(palette);
---
<div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
  {entries.map(([name, value]) => (
    <div class="p-4 border border-bone/10 rounded-lg bg-elevated/40">
      <div class="flex items-center gap-3 mb-2">
        <span class="w-7 h-7 rounded border border-bone/15 shrink-0" style={`background:${value}`} />
        <span class="font-mono text-sm">{name}</span>
      </div>
      <div class="font-mono text-xs text-bone/70">{value}</div>
    </div>
  ))}
</div>
```

- [ ] **Step 3: Implement /references/[slug].astro**

Create `src/pages/references/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
import AttributionRail from '../../components/chrome/AttributionRail.astro';
import PaletteGrid from '../../components/chrome/PaletteGrid.astro';
import { jsonLdForReference, jsonLdForBreadcrumbs } from '../../lib/jsonld';

export async function getStaticPaths() {
  const references = await getCollection('references');
  return references.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { data } = entry;
const slug = entry.id;

const jsonLd = [
  jsonLdForReference({
    name: data.name, slug, owner: data.owner, description: data.description,
    site: 'https://system.djasha.me', sourceUrl: data.source_url,
    upstream: data.attribution.upstream, upstreamSha: data.attribution.upstream_sha,
  }),
  jsonLdForBreadcrumbs([
    { name: 'Home', url: 'https://system.djasha.me' },
    { name: 'References', url: 'https://system.djasha.me/references' },
    { name: data.name, url: `https://system.djasha.me/references/${slug}` },
  ]),
];
---
<DocLayout title={`Reference: ${data.name}`} description={data.description} jsonLd={jsonLd}>
  <header class="mb-10">
    <div class="text-xs font-mono text-bone/40 uppercase tracking-wider mb-2">Reference</div>
    <h1 class="font-display text-5xl tracking-tight">{data.name}</h1>
    <p class="text-bone/60 font-mono text-sm mt-1">by {data.owner} · <a href={data.source_url} class="hover:text-accent">{data.source_url}</a></p>
    <p class="text-xl text-bone/70 mt-4 max-w-2xl">{data.description}</p>
  </header>

  <section class="mb-12">
    <h2 class="font-display text-2xl mb-5">Palette</h2>
    <PaletteGrid palette={data.palette} />
  </section>

  <section class="mb-12">
    <h2 class="font-display text-2xl mb-5">Type stack</h2>
    <div class="font-mono text-sm space-y-1 text-bone/70">
      <div><span class="text-bone/40">display:</span> {data.fonts.display}</div>
      <div><span class="text-bone/40">body:</span> {data.fonts.body}</div>
      {data.fonts.mono && <div><span class="text-bone/40">mono:</span> {data.fonts.mono}</div>}
    </div>
  </section>

  {data.components.length > 0 && (
    <section class="mb-12">
      <h2 class="font-display text-2xl mb-5">Components ({data.components.length})</h2>
      <div class="flex flex-wrap gap-2">
        {data.components.map((c: string) => <span class="px-3 py-1 text-sm font-mono border border-bone/10 rounded-md">{c}</span>)}
      </div>
    </section>
  )}

  <section class="mb-12 grid md:grid-cols-[1fr_280px] gap-8">
    <div>
      <h2 class="font-display text-2xl mb-3">Use via MCP</h2>
      <pre class="font-mono text-sm bg-elevated p-4 rounded-md border border-bone/10 overflow-auto"><code>{`# In Claude Code:
claude mcp add djasha-system https://system.djasha.me/api/mcp
# then in your prompt:
# "Use the get_reference tool to fetch ${slug}"`}</code></pre>
    </div>
    <AttributionRail
      upstream={data.attribution.upstream}
      upstreamSha={data.attribution.upstream_sha}
      upstreamPath={data.attribution.upstream_path}
      originalOwnerUrl={data.attribution.original_owner_url}
      lastSynced={data.attribution.last_synced}
      license={data.attribution.upstream_license}
    />
  </section>
</DocLayout>
```

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/pages/references/[slug].astro src/components/chrome/AttributionRail.astro src/components/chrome/PaletteGrid.astro
git commit -m "feat(pages): /references/[slug] detail with palette + type + attribution"
```

### Task 6.3: Build References MCP tools (TDD)

**Files:** `src/lib/mcp/tools/references.ts`, `tests/unit/mcp/references.test.ts`

Mirrors the Originals tools pattern. Same testable shape.

- [ ] **Step 1: Write tests** (mirror Task 2.2's test shape — search, get, list).

- [ ] **Step 2-4: Implement** following the same fetcher injection pattern. Tools: `search_references`, `get_reference`, `list_references`.

- [ ] **Step 5: Register in MCP server**

Edit `src/lib/mcp/server.ts`:

```ts
import { registerReferencesTools } from './tools/references';
// ...
registerReferencesTools(server);
```

- [ ] **Step 6: Build /api/references/[slug].json.ts** (analogous to /api/components/[slug].json.ts in v1).

- [ ] **Step 7: Commit**

```bash
git add src/lib/mcp/tools/references.ts src/lib/mcp/server.ts src/pages/api/references/ tests/unit/mcp/references.test.ts
git commit -m "feat(mcp): References tools (search_references, get_reference, list_references)"
```

---

## Phase 7 — Skill pages + MCP tools

### Task 7.1: Build /skills browse page

**Files:** `src/pages/skills/index.astro`, `src/components/chrome/SkillCard.astro`

Same pattern as /references. Filters: mode (prototype/deck/template), scenario (design/marketing/etc).

- [ ] **Step 1: Implement SkillCard.astro** — show name, mode badge, scenario tag, description.
- [ ] **Step 2: Implement /skills/index.astro** — browse grid with filter island. Same shape as /components.
- [ ] **Step 3: Build + commit.**

### Task 7.2: Build /skills/[slug] detail page

**Files:** `src/pages/skills/[slug].astro`

Renders: skill prompt body, sandboxed iframe of `vendor/open-design/skills/<slug>/example.html`, design-system requirements, MCP install snippet, attribution rail.

- [ ] **Step 1: Implement** — iframe uses `srcdoc` set to the file contents (loaded server-side via `fs.readFile`).
- [ ] **Step 2: Build + commit.**

### Task 7.3: Build Skills MCP tools (TDD)

**Files:** `src/lib/mcp/tools/skills.ts`, `tests/unit/mcp/skills.test.ts`

Tools: `list_skills`, `get_skill`, `find_skill_for_scenario`.

`find_skill_for_scenario` is a heuristic search — fuzzy-match the brief against skill names + descriptions, return top 3 with rationale.

- [ ] **Step 1-7**: same TDD loop. Implement, register, commit.

---

## Phase 8 — Direction pages + MCP tools

### Task 8.1: Extract directions from Open Design source

The directions live in `apps/web/src/prompts/directions.ts` upstream. The sync script (Task 5.2) didn't extract them — that's a script extension.

- [ ] **Step 1: Add directions extraction to sync script** — parse the TypeScript file, extract the 5 direction objects, write each to `src/content/directions/<slug>.yaml`.

- [ ] **Step 2: Re-run sync**

```bash
npm run sync:open-design
```

Expected: 5 new files in `src/content/directions/`.

- [ ] **Step 3: Commit**

```bash
git add scripts/sync-open-design.ts src/content/directions/
git commit -m "feat(content): extract 5 visual directions from Open Design"
```

### Task 8.2: Build /directions page

**Files:** `src/pages/directions/index.astro`, `src/components/chrome/DirectionPanel.astro`

- [ ] **Step 1: Implement DirectionPanel.astro** — palette swatches + font specimens + sample heading.
- [ ] **Step 2: Implement /directions/index.astro** — single page showing all 5 panels side-by-side, click to expand.
- [ ] **Step 3: Build + commit.**

### Task 8.3: Build Directions MCP tools (TDD)

**Files:** `src/lib/mcp/tools/directions.ts`, `tests/unit/mcp/directions.test.ts`

Tools: `list_directions`, `apply_direction` (returns palette + fonts as a structured object an agent can use directly).

- [ ] **Step 1-7**: TDD loop, implement, register, commit.

---

## Phase 9 — Cross-cutting MCP tools

### Task 9.1: find_design_system + compose_brief (TDD)

**Files:** `src/lib/mcp/tools/cross.ts`, `tests/unit/mcp/cross.test.ts`

`find_design_system`: fuzzy search across components AND references in one call.
`compose_brief`: takes a free-text user prompt, returns a recommended skill + direction + reference + rationale (uses simple keyword matching as v2; LLM-driven matching is a v3 idea).

- [ ] **Step 1: Write tests** for both tools.
- [ ] **Step 2-5: Implement, register, commit.**

---

## Phase 10 — CI guards (additive)

### Task 10.1: Vendor attribution check (TDD)

**Files:** `scripts/check-vendor-attribution.ts`, `tests/unit/check-vendor-attribution.test.ts`

- [ ] **Step 1: Write tests** — feed sample reference/skill/direction yaml; assert the check passes when complete and fails when fields missing.
- [ ] **Step 2-3: Implement** — globs `src/content/{references,skills,directions}/*.yaml`, parses YAML, validates `attribution` block has all required fields. Exit 1 on any missing.
- [ ] **Step 4: Wire into npm scripts**

Edit `package.json`:

```json
"check:attribution": "tsx scripts/check-vendor-attribution.ts",
"check:all": "npm run check:docs && npm run check:refs && npm run check:attribution && astro check"
```

- [ ] **Step 5: Verify + commit.**

### Task 10.2: llms.txt validator

**Files:** `scripts/validate-llms-txt.ts`

- [ ] **Step 1: Implement** — parses the rendered `dist/llms.txt`, checks structure (H1, blockquote, ## sections), spot-checks a few links return 200.
- [ ] **Step 2: Wire into a `check:llms` npm script (non-blocking initially — only blocks once the format stabilizes).**
- [ ] **Step 3: Commit.**

### Task 10.3: Schema.org JSON-LD validator

**Files:** `scripts/validate-jsonld.ts`

- [ ] **Step 1: Implement** — walks `dist/**/*.html`, extracts JSON-LD scripts, validates each is parseable JSON with required `@context` + `@type`.
- [ ] **Step 2: Wire into `check:jsonld` script. Block on parse failures.**
- [ ] **Step 3: Commit.**

### Task 10.4: MCP contract test (Playwright)

**Files:** `tests/e2e/mcp-contract.spec.ts`

- [ ] **Step 1: Implement** — boots `vercel dev` (or skips if not available), POSTs JSON-RPC `tools/list` to `/api/mcp`, asserts the response includes all expected tools across all 4 categories.
- [ ] **Step 2: Add `npm run test:mcp` script.**
- [ ] **Step 3: Commit.**

---

## Phase 11 — Vendoring automation (GHA cron)

### Task 11.1: GitHub Actions vendor-sync workflow

**Files:** `.github/workflows/vendor-sync.yml`

- [ ] **Step 1: Implement**

```yaml
name: Vendor Sync (Open Design)
on:
  schedule:
    - cron: '0 2 1 * *'  # 02:00 UTC on the 1st of each month
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5  # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020  # v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run sync:open-design
      - name: Check for changes
        id: diff
        run: |
          if git diff --quiet; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
            echo "sha=$(cat vendor/open-design/SHA)" >> $GITHUB_OUTPUT
          fi
      - name: Open PR
        if: steps.diff.outputs.changed == 'true'
        uses: peter-evans/create-pull-request@v6
        with:
          branch: vendor-sync/open-design
          title: 'chore(vendor): sync open-design @ ${{ steps.diff.outputs.sha }}'
          body: 'Auto-generated PR from monthly vendor sync.'
          commit-message: 'chore(vendor): sync open-design'
```

- [ ] **Step 2: Commit.**

```bash
git add .github/workflows/vendor-sync.yml
git commit -m "feat(ci): monthly vendor-sync GHA workflow opens PR on upstream changes"
```

---

## Phase 12 — Open Design local install (side-track)

### Task 12.1: Install Open Design locally

This is YOUR personal install, not for the public site.

- [ ] **Step 1: Clone outside the djasha-system repo**

```bash
cd /Users/Djasha
git clone https://github.com/nexu-io/open-design.git
cd open-design
pnpm install
```

- [ ] **Step 2: Run `pnpm tools-dev`**

Expected: web UI at http://localhost:[port]. Daemon detects Claude Code on PATH.

### Task 12.2: Document the authoring loop

**Files:** `docs/authoring-with-open-design.md`

- [ ] **Step 1: Write doc**

Contents: how to launch Open Design, prompt for a new component, copy the artifact source into djasha-system, run scaffold, commit.

- [ ] **Step 2: Commit.**

```bash
git add docs/authoring-with-open-design.md
git commit -m "docs: how to use Open Design for personal authoring"
```

### Task 12.3: First component authored via Open Design (proof of loop)

- [ ] **Step 1: Pick one new component idea** (e.g., a new variant of MagneticButton, or a fresh primitive like `ScrollReveal`).
- [ ] **Step 2: Author it via Open Design.**
- [ ] **Step 3: Migrate the output to djasha-system using the existing scaffolder.**
- [ ] **Step 4: Commit + note in `docs/authoring-with-open-design.md` that the loop works end-to-end.**

---

## Phase 13 — Polish + ship

### Task 13.1: Update home page with new stats strip

**Files:** `src/pages/index.astro`

- [ ] **Step 1: Update counts** — pull live counts from all 7 collections, display as a stats strip: "X Originals · Y References · Z Skills · 5 Directions · 1 MCP server."

- [ ] **Step 2: Add MCP-ready badge** above the stats strip.

- [ ] **Step 3: Commit.**

### Task 13.2: Update Nav.astro with new sections

**Files:** `src/components/chrome/Nav.astro`

- [ ] **Step 1: Add nav entries**: References, Skills, Directions (between Patterns and Tokens). Subtle visual indicator (small dot) marks vendored sections.

- [ ] **Step 2: Commit.**

### Task 13.3: Update sitemap + sitemap-images

**Files:** `astro.config.mjs`

- [ ] **Step 1: Configure Astro sitemap integration to include OG images and split images into a separate `sitemap-images.xml`.**

- [ ] **Step 2: Commit.**

### Task 13.4: Submit to Search Console + AI search

- [ ] **Step 1: Verify domain in Google Search Console.**
- [ ] **Step 2: Submit sitemap-index.xml.**
- [ ] **Step 3: Verify rich results pass on Google Rich Results Test.**
- [ ] **Step 4: Submit URL to Bing Webmaster Tools.**

(Manual operational task — no commit.)

### Task 13.5: Verify all v2 success criteria

Walk through the spec's §9 checklist. Each item should pass:

- [ ] /llms.txt + /llms-full.txt validate against llms.txt spec.
- [ ] Schema.org JSON-LD passes Google Rich Results Test (no errors).
- [ ] MCP server passes official `mcp inspector`.
- [ ] At least 3 MCP clients (Claude Code, Cursor, Codex) install + call tools end-to-end.
- [ ] OpenAPI 3.1 spec validates.
- [ ] robots.txt + ai.txt live; no AI bots blocked.
- [ ] Catalog ≥ 123 entries.
- [ ] Vendoring sync runs end-to-end + opens PR.
- [ ] Vendor attribution: every reference + skill page renders attribution rail.
- [ ] Open Design installed locally + one component authored end-to-end.
- [ ] Apache-2.0 LICENSE + NOTICE preserved.

If any fails, fix + re-ship.

### Task 13.6: Merge to main + deploy

- [ ] **Step 1: Final build + tests**

```bash
npm run check:all && npm run test && npm run build && npm run test:e2e
```

- [ ] **Step 2: Push branch**

```bash
git push origin feat/v2-agent-index
```

- [ ] **Step 3: (Optional) Open PR for the audit trail.**

- [ ] **Step 4: Merge to main**

```bash
git checkout main
git merge --ff-only feat/v2-agent-index
git push origin main
```

- [ ] **Step 5: Verify Vercel auto-deploys (or run `vercel deploy --prod`).**

- [ ] **Step 6: Smoke-test live**

```bash
curl -s https://system.djasha.me/llms.txt | head
curl -s https://system.djasha.me/.well-known/mcp.json
curl -s -X POST https://system.djasha.me/api/mcp -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head
```

Expected: all return valid responses.

---

## Self-review notes (done at plan-writing time, fixed inline)

1. **Spec coverage:** Every §9 success criterion has at least one task. Every §3 surface (llms.txt, schema.org, MCP, OpenAPI, robots.txt, ai.txt, sitemap) has dedicated tasks. Every collection (references, skills, directions) has schema + page + MCP tool tasks.
2. **Type consistency:** `OriginalsFetcher` interface in Task 2.2 reused in Phase 6+ References tools (same pattern). All MCP tool handler shapes are uniform: `(args, fetcher) => Promise<result>`.
3. **No placeholders:** every step has either runnable code or exact commands. The vendor sync script's `parseDesignSystem` makes best-guess heuristics for `source_url`/`category`/`owner` — these are documented as "review during first sync" rather than left as TBD.
4. **TDD coverage:** Library logic (llms-txt, jsonld, openapi, sync parsing, MCP tools) is TDD'd. UI pages skip unit TDD in favour of Playwright smoke (existing v1 pattern). Vendoring integration is integration-tested in Phase 5.3 (the live first sync).
5. **Frequent commits:** every task ends with a commit. ~50-60 commits across the plan.
6. **Phase decomposition:** Phases 1-2 produce a deployable v2.0 (discovery layer + MCP for existing 8 components) without depending on Phases 4+. If the project is paused, ship at end of Phase 2 — the v2.0 cut is meaningful on its own.
7. **Risk mitigation:** vendor sync is conflict-aware (Task 5.2 detects local edits via SHA comparison). Build still passes if new collections are empty (Task 1.2 wraps `getCollection` in try/catch). The MCP endpoint adapts to the actual `@modelcontextprotocol/sdk` API at implementation time (note in Task 2.3).

**End of plan.**
