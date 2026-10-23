import type { Group, Tab, Topic } from '@/content/types';
import { getTab, locate, MUST_TITLE, mustId, orderOf, type Located } from './content';

export interface Nav { prev: string; next: string; pos: string; close: string }
export type Resolved =
  | { kind: 'concept'; id: string; tab: Tab; topic: Topic; topicIndex: number; group: Group; located: Located; nav: Nav }
  | { kind: 'must'; id: string; tab: Tab; topic: Topic; topicIndex: number; nav: Nav };

/** 진도 id를 주소로 바꾼다. 알아둘 것은 `must-<주제 키>` */
export function hrefOf(id: string): string {
  const [tab, rest] = id.split('/');
  return rest.startsWith('~') ? `/${tab}/must-${rest.slice(1)}` : `/${tab}/${rest}`;
}

export const mustSlugs = (tab: Tab) => tab.topics.map(tp => `must-${tp.key}`);

export function resolve(tabKey: string, rawSlug: string): Resolved | undefined {
  const tab = getTab(tabKey);
  if (!tab) return;
  const slug = decodeURIComponent(rawSlug);
  const m = slug.match(/^must-(.+)$/);
  let id: string, base: Omit<Extract<Resolved, { kind: 'concept' }>, 'nav'> | Omit<Extract<Resolved, { kind: 'must' }>, 'nav'>;
  if (m) {
    const topicIndex = tab.topics.findIndex(tp => tp.key === m[1]);
    if (topicIndex < 0) return;
    const topic = tab.topics[topicIndex];
    id = mustId(tab.key, topic);
    base = { kind: 'must', id, tab, topic, topicIndex };
  } else {
    const located = locate(`${tab.key}/${slug}`);
    if (!located) return;
    id = located.concept.id;
    base = { kind: 'concept', id, tab, topic: located.topic, topicIndex: located.topicIndex, group: located.group, located };
  }
  const order = orderOf(tab), k = order.indexOf(id), n = order.length;
  const nav = { prev: hrefOf(order[(k - 1 + n) % n]), next: hrefOf(order[(k + 1) % n]), pos: `${k + 1} / ${n}`, close: `/${tab.key}` };
  return { ...base, nav } as Resolved;
}

export const mustTitle = (topic: Topic) => `${topic.name}에서 ${MUST_TITLE}`;
