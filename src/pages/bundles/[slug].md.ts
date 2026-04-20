import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import matter from 'gray-matter';
import fs from 'node:fs/promises';
import path from 'node:path';
import { composeBundle } from '../../lib/bundle';
import { languageFromPath, readSource } from '../../lib/source-reader';

export const getStaticPaths: GetStaticPaths = async () => {
  const components = await getCollection('components');
  const patterns = await getCollection('patterns');
  return [...components, ...patterns].map((entry) => ({
    params: { slug: entry.id },
    props: { entry, collection: entry.collection },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as any;
  const collection = props.collection as 'components' | 'patterns';

  const rawPath = path.resolve(process.cwd(), `src/content/${collection}/${entry.id}.doc.mdx`);
  const raw = await fs.readFile(rawPath, 'utf8');
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
