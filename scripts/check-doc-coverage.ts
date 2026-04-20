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
