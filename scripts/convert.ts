// 정적 사이트(v1-static)의 data/*.js를 content/<탭>/<주제>.ts로 한 번 변환한다
// 사용법: npm run content:convert -- <v1-static 폴더>
// v1 데이터는 타입이 없는 전역 객체라 이 일회성 스크립트에서만 any를 허용한다
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { slugify } from '../lib/slug.ts';
import type { Concept, TabKey, Topic } from '../content/types.ts';

const TABS: { key: TabKey; title: string; root: string }[] = [
  { key: 'spring', title: 'Spring', root: 'Spring' },
  { key: 'cs', title: 'CS 기초', root: 'CS' },
  { key: 'net', title: '네트워크', root: 'Network' },
  { key: 'ds', title: '자료구조', root: '자료구조' },
  { key: 'algo', title: '알고리즘', root: 'Algorithm' },
];
const MUST_TITLE = '알아둘 것';

const src = process.argv[2];
if (!src) throw new Error('v1-static 폴더 경로를 넘겨 주세요');
const ctx: { window: Record<string, any> } = { window: {} };
vm.createContext(ctx);
const dataDir = path.join(src, 'data');
for (const dir of [dataDir, path.join(dataDir, 'x')]) {
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
}
const BASE = ctx.window.MINDMAP, EXT = ctx.window.MINDMAP_X || {};

const codeLang = (c: string): Concept['codeLang'] => {
  if (/^\s*(SELECT|CREATE|UPDATE|INSERT|DELETE|ALTER|EXPLAIN|--)/im.test(c) && !/\b(class|public|@\w+)\b/.test(c)) return 'sql';
  if (/^\s*(\$ |curl |ss |tcpdump |ping |traceroute |dig |nslookup |netstat |docker |kubectl |redis-cli |sudo |ip )/m.test(c)) return 'sh';
  if (/^\s*[\w.-]+:\s*$/m.test(c) && !/[;{}()]/.test(c)) return 'yaml';
  return 'java';
};

// 1) 주제별로 개념을 만들고 탭 안에서 슬러그를 정한다
const tabs = TABS.map(t => {
  const keys = Object.keys(BASE).filter(k => k.startsWith(t.key + '-')).sort((a, b) => +a.split('-')[1] - +b.split('-')[1]);
  const used = new Set<string>();
  const topics = keys.map(key => {
    const b = BASE[key], x = EXT[key] || {};
    const topic: Topic = {
      key, name: b.name, must: b.must,
      groups: b.groups.map((g: any) => ({
        name: g.name,
        ...(x.groups?.[g.name]?.cmp ? { compare: x.groups[g.name].cmp } : {}),
        concepts: g.items.map((raw: any) => {
          const it = { ...raw, ...(x.items?.[raw.t] || {}) };
          let slug = slugify(it.t) || 'concept';
          for (let n = 2; used.has(slug); n++) slug = `${slugify(it.t)}-${n}`;
          used.add(slug);
          const c: Concept = { id: `${t.key}/${slug}`, slug, title: it.t, deep: !!it.deep, def: it.d };
          if (it.why) c.why = it.why;
          if (it.how?.length) c.how = it.how;
          if (it.flow?.length) c.flow = it.flow;
          if (it.code) { const code: string = it.code.replace(/^\n+|\s+$/g, ''); c.code = code; c.codeLang = codeLang(code); }
          if (it.use?.length) c.use = it.use;
          if (it.warn?.length) c.warn = it.warn;
          if (it.myth?.length) c.myth = it.myth;
          if (it.ans) c.answer = it.ans;
          if (it.ana) c.analogy = it.ana;
          if (it.qa) c.qa = it.qa;
          if (it.fq?.length) c.followUps = it.fq;
          if (it.rel?.length) (c as any)._rel = it.rel;
          return c;
        }),
      })),
    };
    return topic;
  });
  return { ...t, topics };
});

// 2) 관련 개념을 제목에서 id로 바꾼다. 지금 탭을 먼저 찾고, 없으면 다른 탭에서 찾는다
const byTab = new Map(tabs.map(t => [t.key, new Map(t.topics.flatMap(tp => tp.groups.flatMap(g => g.concepts.map(c => [c.title, c.id] as const))))]));
const unresolved: string[] = [];
for (const t of tabs) for (const tp of t.topics) for (const g of tp.groups) for (const c of g.concepts as any[]) {
  if (!c._rel) continue;
  const ids = c._rel.map((r: string) => {
    for (const key of [t.key, ...TABS.map(x => x.key).filter(k => k !== t.key)]) { const id = byTab.get(key)!.get(r); if (id) return id; }
    unresolved.push(`${c.id} → ${r}`);
    return null;
  }).filter(Boolean);
  delete c._rel;
  if (ids.length) c.related = ids;
}

// 3) 파일로 쓴다
// 짧은 배열은 한 줄로 써서 사람이 고치기 쉽게 한다
function pretty(v: unknown, ind = ''): string {
  const next = ind + '  ';
  if (Array.isArray(v)) {
    const flat = JSON.stringify(v);
    if (v.every(x => typeof x !== 'object' || (Array.isArray(x) && x.every(y => typeof y !== 'object'))) && flat.length + ind.length < 110) return flat.replace(/","/g, '", "').replace(/\],\[/g, '], [');
    return `[\n${v.map(x => next + pretty(x, next)).join(',\n')}\n${ind}]`;
  }
  if (v && typeof v === 'object') return `{\n${Object.entries(v).map(([k, x]) => `${next}${/^[a-zA-Z_]\w*$/.test(k) ? k : JSON.stringify(k)}: ${pretty(x, next)}`).join(',\n')}\n${ind}}`;
  return JSON.stringify(v);
}
const root = path.resolve(import.meta.dirname, '..');
const contentDir = path.join(root, 'content');
const imports: string[] = [], tabLines: string[] = [];
for (const t of tabs) {
  fs.mkdirSync(path.join(contentDir, t.key), { recursive: true });
  for (const tp of t.topics) {
    const name = tp.key.replace('-', '_');
    fs.writeFileSync(path.join(contentDir, t.key, `${tp.key}.ts`),
      `import type { Topic } from '../types';\n\nconst topic: Topic = ${pretty(tp)};\n\nexport default topic;\n`);
    imports.push(`import ${name} from './${t.key}/${tp.key}';`);
  }
  tabLines.push(`  { key: '${t.key}', title: '${t.title}', root: '${t.root}', topics: [${t.topics.map(tp => tp.key.replace('-', '_')).join(', ')}] },`);
}
fs.writeFileSync(path.join(contentDir, 'index.ts'),
  `// scripts/convert.ts가 만든 파일이다. 주제를 추가하면 import와 topics 배열에 직접 이어서 적는다\nimport type { Tab } from './types';\n${imports.join('\n')}\n\nexport const TABS: Tab[] = [\n${tabLines.join('\n')}\n];\n`);

// 4) v1의 완료 기록 키('탭|주제|묶음|개념', '탭|주제|알아둘 것')를 새 id로 바꾸는 표
const legacy: Record<string, string> = {};
for (const t of tabs) for (const tp of t.topics) {
  legacy[`${t.key}|${tp.name}|${MUST_TITLE}`] = `${t.key}/~${tp.key}`;
  for (const g of tp.groups) for (const c of g.concepts) legacy[`${t.key}|${tp.name}|${g.name}|${c.title}`] = c.id;
}
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public', 'legacy-progress-map.json'), JSON.stringify(legacy));

const count = tabs.reduce((s, t) => s + t.topics.reduce((a, tp) => a + tp.groups.reduce((b, g) => b + g.concepts.length, 0), 0), 0);
console.log(`탭 ${tabs.length}개 · 주제 ${tabs.reduce((s, t) => s + t.topics.length, 0)}개 · 개념 ${count}개 변환`);
if (unresolved.length) console.log(`연결하지 못한 관련 개념 ${unresolved.length}개:\n  ${unresolved.join('\n  ')}`);
