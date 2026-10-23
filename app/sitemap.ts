import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { tabs } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    { url: base },
    ...tabs().flatMap(t => [
      { url: `${base}/${t.key}` },
      ...t.topics.flatMap(tp => tp.groups.flatMap(g => g.concepts.map(c => ({ url: `${base}/${t.key}/${c.slug}` })))),
    ]),
  ];
}
