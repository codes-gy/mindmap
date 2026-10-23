// 검색 인덱스를 public/search-index.json으로 만든다 (빌드 전에 실행)
import fs from 'node:fs';
import path from 'node:path';
import { TABS } from '../content/index.ts';

export interface SearchEntry {
  href: string; title: string; path: string; def: string; deep: boolean; color: number;
  /** 제목 외에 검색에 쓰는 본문 (면접 질문, 꼬리 질문) */
  extra: string;
}

const entries: SearchEntry[] = TABS.flatMap(tab => tab.topics.flatMap((tp, i) => [
  ...tp.groups.flatMap(g => g.concepts.map(c => ({
    href: `/${tab.key}/${c.slug}`, title: c.title, path: `${tab.title} › ${tp.name} › ${g.name}`,
    def: c.def, deep: c.deep, color: i % 10,
    extra: [c.qa?.[0], ...(c.followUps ?? []).map(f => f[0])].filter(Boolean).join(' '),
  }))),
  { href: `/${tab.key}/must-${tp.key}`, title: `${tp.name}에서 알아둘 것`, path: `${tab.title} › ${tp.name}`, def: tp.must[0], deep: false, color: i % 10, extra: tp.must.slice(1).join(' ') },
]));

const out = path.resolve(import.meta.dirname, '..', 'public', 'search-index.json');
fs.writeFileSync(out, JSON.stringify(entries));
console.log(`검색 인덱스 ${entries.length}개 항목 → public/search-index.json (${Math.round(fs.statSync(out).size / 1024)}KB)`);
