export interface Token {
  slug: string;
  name: string;
  category: string;
  value: string;
  tailwind_class?: string;
  css_var?: string;
  description?: string;
}

export function resolveTokens(slugs: string[], known: Map<string, Token>): Token[] {
  return slugs.map((slug) => {
    const token = known.get(slug);
    if (!token) throw new Error(`Unknown token reference: "${slug}"`);
    return token;
  });
}
