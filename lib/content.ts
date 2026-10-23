import { TABS } from '@/content';
import type { Concept, Group, Tab, TabKey, Topic } from '@/content/types';

export const MUST_TITLE = '알아둘 것';

export interface Located {
  tab: Tab;
  topic: Topic;
  topicIndex: number;
  group: Group;
  concept: Concept;
}

const index = new Map<string, Located>();
for (const tab of TABS) {
  tab.topics.forEach((topic, topicIndex) => {
    for (const group of topic.groups) for (const concept of group.concepts) index.set(concept.id, { tab, topic, topicIndex, group, concept });
  });
}

export const tabs = (): Tab[] => TABS;
export const isTabKey = (k: string): k is TabKey => TABS.some(t => t.key === k);
export function getTab(key: string): Tab | undefined { return TABS.find(t => t.key === key); }
export function locate(id: string): Located | undefined { return index.get(id); }
export function getConcept(tab: string, slug: string): Located | undefined { return index.get(`${tab}/${slug}`); }
export const mustId = (tab: TabKey, topic: Topic) => `${tab}/~${topic.key}`;

/** 카드의 이전·다음 이동 순서: 주제마다 개념들 다음에 '알아둘 것' */
export function orderOf(tab: Tab): string[] {
  return tab.topics.flatMap(tp => [...tp.groups.flatMap(g => g.concepts.map(c => c.id)), mustId(tab.key, tp)]);
}

// 클라이언트로 보내는 가벼운 뼈대: 마인드맵과 진도 계산에 필요한 것만 담는다
export interface SkeletonConcept { id: string; slug: string; title: string; deep: boolean }
export interface SkeletonTopic { key: string; must: string; mustCount: number; name: string; groups: { name: string; concepts: SkeletonConcept[] }[] }
export interface SkeletonTab { key: TabKey; title: string; root: string; topics: SkeletonTopic[] }

export function skeleton(tab: Tab): SkeletonTab {
  return {
    key: tab.key, title: tab.title, root: tab.root,
    topics: tab.topics.map(tp => ({
      key: tp.key, name: tp.name, must: mustId(tab.key, tp), mustCount: tp.must.length,
      groups: tp.groups.map(g => ({ name: g.name, concepts: g.concepts.map(({ id, slug, title, deep }) => ({ id, slug, title, deep })) })),
    })),
  };
}
export const skeletons = (): SkeletonTab[] => TABS.map(skeleton);
