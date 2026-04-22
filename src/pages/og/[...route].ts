import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';

const components = await getCollection('components');
const patterns = await getCollection('patterns');

const pages: Record<string, { title: string; description: string }> = Object.fromEntries(
  [...components, ...patterns].map((entry) => [
    entry.id,
    { title: entry.data.name, description: entry.data.description },
  ]),
);

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  param: 'route',
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[10, 6, 6]],
    border: { color: [232, 70, 44], width: 8, side: 'inline-start' as const },
    padding: 80,
    fonts: [
      './public/fonts/noto-sans-latin-400-normal.ttf',
      './public/fonts/noto-sans-latin-800-normal.ttf',
    ],
    font: {
      title: { size: 96, color: [245, 241, 236], weight: 'ExtraBold' as const },
      description: { size: 32, color: [171, 167, 162], weight: 'Normal' as const },
    },
  }),
});
