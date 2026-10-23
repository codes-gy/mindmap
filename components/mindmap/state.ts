'use client';

import { useSyncExternalStore } from 'react';

// 탭마다 마인드맵의 접힘·펼침 상태를 기억한다. 대시보드의 주제 버튼도 이 상태를 바꾼다
export interface MapState { collapsed: ReadonlySet<number>; expanded: ReadonlySet<string> }

const INITIAL: MapState = { collapsed: new Set(), expanded: new Set() };
const states = new Map<string, MapState>();
const subs = new Set<() => void>();

const read = (tab: string) => states.get(tab) ?? INITIAL;
function write(tab: string, next: MapState) { states.set(tab, next); subs.forEach(fn => fn()); }
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

export function useMapState(tab: string): MapState {
  return useSyncExternalStore(subscribe, () => read(tab), () => INITIAL);
}

const toggled = <T,>(set: ReadonlySet<T>, v: T) => { const n = new Set(set); if (n.has(v)) n.delete(v); else n.add(v); return n; };

export const mapActions = {
  toggleTopic(tab: string, i: number) { const s = read(tab); write(tab, { ...s, collapsed: toggled(s.collapsed, i) }); },
  toggleGroup(tab: string, key: string) { const s = read(tab); write(tab, { ...s, expanded: toggled(s.expanded, key) }); },
  /** 선택한 개념이 보이도록 주제와 묶음을 연다 */
  reveal(tab: string, i: number, g?: number) {
    const s = read(tab);
    const open = g === undefined || s.expanded.has(`${i}-${g}`);
    if (!s.collapsed.has(i) && open) return;
    const collapsed = new Set(s.collapsed); collapsed.delete(i);
    const expanded = g === undefined ? s.expanded : new Set(s.expanded).add(`${i}-${g}`);
    write(tab, { collapsed, expanded });
  },
  expandTopics(tab: string) { write(tab, { ...read(tab), collapsed: new Set() }); },
  expandAll(tab: string, groupKeys: string[]) { write(tab, { collapsed: new Set(), expanded: new Set(groupKeys) }); },
  collapseAll(tab: string, topicCount: number) { write(tab, { collapsed: new Set(Array.from({ length: topicCount }, (_, i) => i)), expanded: new Set() }); },
};
