import fs from 'node:fs';
import { slugify } from './utils';

const name = process.argv[2];
if (!name) {
  console.error('Usage: npx tsx scripts/scaffold-component.ts <ComponentName>');
  process.exit(1);
}

const slug = slugify(name);
const today = new Date().toISOString().split('T')[0];

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
created: ${today}
---

## Prompt

TODO — natural-language brief describing intent, behavior, constraints.

## Usage

TODO — when to use, when not.

## Do / Don't

- **Do** TODO.
- **Don't** TODO.
`;

const playground = `export const knobs = [] as const;
export type KnobValues = {};
export function toCode(_v: KnobValues): string {
  return \`<${name} />\`;
}
`;

const preview = `import { ${name} } from './${name}';

export default function Demo() {
  return (
    <div className="flex items-center justify-center min-h-[240px]">
      <${name} />
    </div>
  );
}
`;

fs.mkdirSync('src/content/components', { recursive: true });
fs.writeFileSync(`src/content/components/${slug}.doc.mdx`, doc);
fs.writeFileSync(`src/components/${name}.playground.tsx`, playground);
fs.writeFileSync(`src/components/${name}.preview.tsx`, preview);
console.log(`Scaffolded ${name} (slug: ${slug}).`);
console.log(`  src/content/components/${slug}.doc.mdx`);
console.log(`  src/components/${name}.playground.tsx`);
console.log(`  src/components/${name}.preview.tsx`);
console.log(`Fill in TODOs + register in:`);
console.log(`  src/components/chrome/PlaygroundIsland.tsx`);
console.log(`  src/components/chrome/PreviewIsland.tsx`);
