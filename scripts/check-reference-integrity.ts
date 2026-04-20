import { globSync } from 'glob';
import matter from 'gray-matter';
import fs from 'node:fs';
import yaml from 'js-yaml';

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
      const parsed = yaml.load(fs.readFileSync(f, 'utf8')) as { category: string; name: string };
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
