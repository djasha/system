export interface BundleInput {
  name: string;
  description: string;
  promptBody: string;
  usageBody: string;
  tokens: Array<{ slug: string; value: string }>;
  a11yNotes: string;
  sourcePath: string;
  sourceCode: string;
  sourceLanguage: string;
}

export function composeBundle(i: BundleInput): string {
  const tokenLines = i.tokens.map((t) => `- \`${t.slug}\` — \`${t.value}\``).join('\n');
  return `# ${i.name}

${i.description}

## Prompt

${i.promptBody.trim()}

## Tokens

${tokenLines || '_(none)_'}

## A11y

${i.a11yNotes.trim()}

## Source (\`${i.sourcePath}\`)

\`\`\`${i.sourceLanguage}
${i.sourceCode.trimEnd()}
\`\`\`

## Usage

${i.usageBody.trim()}
`;
}
