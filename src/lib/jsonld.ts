const PUBLISHER = {
  '@type': 'Person',
  name: 'Diaa Asha',
  url: 'https://djasha.me',
  sameAs: ['https://github.com/djasha'],
};

export function jsonLdForWebsite(i: { url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Djasha System',
    description: 'The agent-first index of design systems and skills.',
    url: i.url,
    publisher: PUBLISHER,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${i.url}/components?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function jsonLdForComponent(i: {
  name: string; slug: string; description: string; sourcePath: string; tags: string[];
  site: string; githubBase: string; license: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: i.name,
    description: i.description,
    url: `${i.site}/components/${i.slug}`,
    codeRepository: `${i.githubBase}/blob/main/${i.sourcePath}`,
    programmingLanguage: 'TypeScript',
    keywords: i.tags.join(', '),
    license: i.license,
    creator: PUBLISHER,
    publisher: PUBLISHER,
  };
}

export function jsonLdForReference(i: {
  name: string; slug: string; owner: string; description: string; site: string; sourceUrl: string; upstream: string; upstreamSha: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${i.name} (Reference)`,
    description: i.description,
    url: `${i.site}/references/${i.slug}`,
    creator: { '@type': 'Organization', name: i.owner, url: i.sourceUrl },
    publisher: PUBLISHER,
    isBasedOn: {
      '@type': 'CreativeWork',
      url: i.upstream,
      identifier: i.upstreamSha,
      name: 'nexu-io/open-design',
    },
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
  };
}

export function jsonLdForSkill(i: {
  name: string; slug: string; description: string; mode: string; site: string; upstream: string; upstreamSha: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: i.name,
    description: i.description,
    url: `${i.site}/skills/${i.slug}`,
    additionalType: `https://djasha.me/schema/AgentSkill/${i.mode}`,
    publisher: PUBLISHER,
    isBasedOn: { '@type': 'CreativeWork', url: i.upstream, identifier: i.upstreamSha, name: 'nexu-io/open-design' },
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
  };
}

export function jsonLdForBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
