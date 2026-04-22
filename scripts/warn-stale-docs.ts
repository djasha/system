import { execSync } from 'node:child_process';
import { globSync } from 'glob';
import path from 'node:path';
import { slugify } from './utils';

function lastCommitTimestamp(file: string): number {
  try {
    const out = execSync(`git log -1 --format=%ct -- "${file}"`, { encoding: 'utf8' }).trim();
    return out ? Number(out) * 1000 : 0;
  } catch { return 0; }
}

const WINDOW_DAYS = 30;
const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;

const sources = globSync('src/components/*.{tsx,astro}').filter((f) => !/\.(playground|preview)\.(tsx|astro)$/.test(f));
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
