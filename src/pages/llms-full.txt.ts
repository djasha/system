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
