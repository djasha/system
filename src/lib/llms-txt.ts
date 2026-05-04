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
