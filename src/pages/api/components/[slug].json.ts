import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import matter from 'gray-matter';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readSource, languageFromPath } from '../../../lib/source-reader';

export const getStaticPaths: GetStaticPaths = async () => {
  const components = await getCollection('components');
  return components.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
};

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as any;

  const rawPath = path.resolve(process.cwd(), `src/content/components/${entry.id}.doc.mdx`);
  const raw = await fs.readFile(rawPath, 'utf8');
  const { content: body } = matter(raw);
  const extract = (h: string) =>
    body.match(new RegExp(`##\\s+${h}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i'))?.[1].trim() ?? '';

  const tokens = await getCollection('tokens');
  const tokenMap = new Map(tokens.map((t) => [`${t.data.category}.${t.data.name}`, t.data]));
  const resolvedTokens = entry.data.tokens_used.map((slug: string) => ({
    slug,
    ...(tokenMap.get(slug) ?? { value: '(unresolved)' }),
  }));

  const relatedCollection = await getCollection('components');
  const relatedMap = new Map(relatedCollection.map((c) => [c.id, c.data]));
  const resolvedRelated = entry.data.related.map((slug: string) => ({
    slug,
    ...(relatedMap.get(slug) ?? {}),
  }));

  const sourceCode = await readSource(entry.data.source_path);
  const sourceLanguage = languageFromPath(entry.data.source_path);

  return new Response(
    JSON.stringify(
      {
        slug: entry.id,
        ...entry.data,
        prompt: extract('Prompt'),
        usage: extract('Usage'),
        do_dont: extract("Do / Don't"),
        tokens_resolved: resolvedTokens,
        related_resolved: resolvedRelated,
        source: { path: entry.data.source_path, language: sourceLanguage, code: sourceCode },
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
