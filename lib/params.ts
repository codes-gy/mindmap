import { getTab } from './content';
import { mustSlugs } from './view';

/** 탭 하나의 모든 개념·알아둘 것 슬러그 (부모 [tab]의 params를 받는다) */
export async function allSlugParams({ params }: { params: Promise<{ tab: string }> | { tab: string } }) {
  const { tab: key } = await params;
  const tab = getTab(key);
  if (!tab) return [];
  return [
    ...tab.topics.flatMap(tp => tp.groups.flatMap(g => g.concepts.map(c => ({ slug: c.slug })))),
    ...mustSlugs(tab).map(slug => ({ slug })),
  ];
}
