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
