import fs from 'node:fs/promises';
import path from 'node:path';
import { codeToHtml } from 'shiki';

export async function readSource(relPath: string): Promise<string> {
  const abs = path.resolve(process.cwd(), relPath);
  return fs.readFile(abs, 'utf8');
}

export function languageFromPath(relPath: string): string {
  const ext = path.extname(relPath).slice(1);
  const map: Record<string, string> = { tsx: 'tsx', jsx: 'jsx', ts: 'ts', js: 'js', astro: 'astro', css: 'css', md: 'md' };
  return map[ext] ?? 'text';
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  return codeToHtml(code, { lang, theme: 'github-dark-dimmed' });
}
