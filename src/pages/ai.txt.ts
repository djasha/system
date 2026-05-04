import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const content = `# Djasha System — AI usage policy
# Library content licensed for AI agent consumption with attribution.

allow: read, search, summarize, embed, mcp-tool-call
prefer: link-back-to-source
attribution: "https://system.djasha.me"
license: see https://github.com/djasha/system/blob/main/LICENSE
contact: me@djasha.me

# Vendored content (References, Skills, Directions) is Apache-2.0 from
# https://github.com/nexu-io/open-design — preserve upstream attribution.
`;
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
