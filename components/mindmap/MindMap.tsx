'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { SkeletonTab } from '@/lib/content';
import { useProgress } from '@/lib/progress/store';
import { QuizToggle } from '@/components/QuizToggle';
import { layoutMap, SIZES, type MapNode, type Measure } from './layout';
import { mapActions, useMapState } from './state';

const SANS = '"IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

function useMeasure(): Measure | null {
  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [fontsReady, setFontsReady] = useState(0);
  useEffect(() => { document.fonts?.ready.then(() => setFontsReady(n => n + 1)); }, []);
  return useMemo(() => {
    if (!isClient) return null;
    const ctx = document.createElement('canvas').getContext('2d')!;
    const cache = new Map<string, number>();
    return (text, font, mono) => {
      const k = `${font}|${mono ? 1 : 0}|${text}|${fontsReady}`;
      let w = cache.get(k);
      if (w === undefined) { ctx.font = `${font} ${mono ? MONO : SANS}`; w = ctx.measureText(text).width; cache.set(k, w); }
      return w;
    };
  }, [isClient, fontsReady]);
}

/** 주소의 슬러그를 선택한 개념 id로 바꾼다. 알아둘 것은 `must-<주제 키>` */
function selectedFrom(tab: SkeletonTab, pathname: string): string | null {
  const slug = decodeURIComponent(pathname.split('/')[2] ?? '');
  if (!slug) return null;
  const m = slug.match(/^must-(.+)$/);
  return m ? `${tab.key}/~${m[1]}` : `${tab.key}/${slug}`;
}

const mark = (x: number, y: number, done: boolean, r = 3.5) => done
  ? <><circle cx={x} cy={y} r={7} /><path className="tick" d={`M${x - 3.5},${y} l2.5,2.6 l4.5,-5`} /></>
  : <circle cx={x} cy={y} r={r} />;

export function MindMap({ tab, tabs }: { tab: SkeletonTab; tabs: { key: string; title: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const done = useProgress();
  const view = useMapState(tab.key);
  const measure = useMeasure();
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const selected = selectedFrom(tab, pathname);

  // 선택한 개념이 보이도록 주제와 묶음을 연다
  useEffect(() => {
    if (!selected) return;
    tab.topics.forEach((tp, i) => {
      if (tp.must === selected) mapActions.reveal(tab.key, i);
      tp.groups.forEach((g, gi) => { if (g.concepts.some(c => c.id === selected)) mapActions.reveal(tab.key, i, gi); });
    });
  }, [selected, tab]);

  const map = useMemo(() => measure && layoutMap(tab, { ...view, done, selected }, measure), [tab, view, done, selected, measure]);

  const centerScroll = () => requestAnimationFrame(() => { const b = boxRef.current; if (b) b.scrollLeft = (b.scrollWidth - b.clientWidth) / 2; });
  useEffect(() => { if (map) centerScroll(); }, [tab.key, !!map]); // eslint-disable-line react-hooks/exhaustive-deps

  const stat = useMemo(() => {
    const groups = tab.topics.reduce((s, t) => s + t.groups.length, 0);
    const concepts = tab.topics.flatMap(t => t.groups.flatMap(g => g.concepts));
    return `${tab.topics.length}개 주제 · ${groups}개 묶음 · ${concepts.length}개 개념 (심화 ${concepts.filter(c => c.deep).length})`;
  }, [tab]);

  function activate(n: MapNode) {
    if (n.kind === 'branch') mapActions.toggleTopic(tab.key, n.b);
    else if (n.kind === 'group') mapActions.toggleGroup(tab.key, `${n.b}-${n.g}`);
    else if (n.kind === 'concept' || n.kind === 'must') { router.push(`/${tab.key}/${n.slug}`, { scroll: false }); return; }
    else return;
    // 다시 그린 뒤에도 같은 노드에 포커스를 둔다
    const sel = n.kind === 'branch' ? `[data-b="${n.b}"][data-kind="branch"]` : `[data-b="${n.b}"][data-g="${n.g}"]`;
    requestAnimationFrame(() => svgRef.current?.querySelector<SVGGElement>(sel)?.focus({ preventScroll: true }));
  }

  return (
    <>
      <div className="toolbar">
        <nav className="tabs" aria-label="마인드맵 선택">
          {tabs.map(t => <Link key={t.key} href={`/${t.key}`} aria-current={t.key === tab.key ? 'page' : undefined} scroll={false}>{t.title}</Link>)}
        </nav>
        <span className="stat">{stat}</span>
        <button type="button" onClick={() => { mapActions.expandTopics(tab.key); centerScroll(); }}>주제 모두 펼치기</button>
        <button type="button" onClick={() => { mapActions.expandAll(tab.key, tab.topics.flatMap((t, i) => t.groups.map((_, g) => `${i}-${g}`))); centerScroll(); }}>개념까지 모두 넓히기</button>
        <button type="button" onClick={() => { mapActions.collapseAll(tab.key, tab.topics.length); centerScroll(); }}>모두 접기</button>
        <QuizToggle />
      </div>

      <div className="map-box" ref={boxRef}>
        {map && (
          <svg ref={svgRef} viewBox={map.viewBox.join(' ')} width={Math.ceil(map.viewBox[2])} height={Math.ceil(map.viewBox[3])} role="group" aria-label={`${tab.root} 마인드맵`}
            onKeyDown={e => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              const el = (e.target as Element).closest<SVGGElement>('g[data-i]');
              if (el) { e.preventDefault(); activate(map.nodes[+el.dataset.i!]); }
            }}>
            {map.edges.map((e, k) => <path key={k} className={`edge b${e.b % 10}${e.level === 'root' ? ' root' : e.level === 'concept' ? ' c' : ''}`} d={e.d} />)}
            {map.nodes.map((n, k) => <Node key={k} n={n} i={k} onActivate={() => activate(n)} />)}
          </svg>
        )}
      </div>
    </>
  );
}

function Node({ n, i, onActivate }: { n: MapNode; i: number; onActivate: () => void }) {
  const { x, y, w, h } = n.box, cy = y + h / 2;
  const common = { 'data-i': i, tabIndex: 0, role: 'button' as const, onClick: onActivate };
  const anchor = (dir: number) => dir > 0 ? 'start' : 'end';

  switch (n.kind) {
    case 'root':
      return <g className="root-node"><rect x={x} y={y} width={w} height={h} rx={24} /><text x={0} y={0} textAnchor="middle">{n.label}</text></g>;
    case 'branch':
      return (
        <g className={`branch b${n.b % 10}`} data-b={n.b} data-kind="branch" aria-expanded={!n.collapsed} aria-label={`${n.label}, ${n.count} 완료, ${n.collapsed ? '펼치기' : '접기'}`} {...common}>
          <rect x={x} y={y} width={w} height={SIZES.BR_H} rx={SIZES.BR_H / 2} />
          <text x={x + w / 2} y={cy} textAnchor="middle">{n.label}<tspan className="cnt" dx={8}>{n.count}</tspan></text>
          {n.collapsed && <text className="more" x={n.dir * ((n.dir > 0 ? x : -(x + w)) + w + 10)} y={cy} textAnchor={anchor(n.dir)}>펼치기</text>}
        </g>
      );
    case 'group': {
      const inner = n.dir > 0 ? x : -(x + w);
      const sym = n.full ? '✓' : n.open ? (n.dir > 0 ? '◂' : '▸') : (n.dir > 0 ? '▸' : '◂');
      return (
        <g className={`group b${n.b % 10}${n.open ? ' open' : ''}${n.full ? ' full' : ''}`} data-b={n.b} data-g={n.g} aria-expanded={n.open} aria-label={`${n.label}, ${n.count} 완료`} {...common}>
          <rect x={x} y={y} width={w} height={h} rx={7} />
          <text className="arrow" x={n.dir * (inner + 14)} y={cy} textAnchor="middle">{sym}</text>
          <text x={n.dir * (inner + 26)} y={cy} textAnchor={anchor(n.dir)}>
            {n.dir > 0 ? <>{n.label}<tspan className="cnt" dx={8}>{n.count}</tspan></> : <><tspan className="cnt">{n.count}</tspan><tspan dx={8}>{n.label}</tspan></>}
          </text>
        </g>
      );
    }
    case 'concept': {
      const inner = n.dir > 0 ? x : -(x + w);
      return (
        <g className={`concept b${n.b % 10}${n.done ? ' done' : ''}${n.on ? ' on' : ''}`} aria-label={`${n.label}${n.deep ? ', 심화' : ''}${n.done ? ', 완료' : ''}`} {...common}>
          <rect x={x} y={y} width={w} height={h} rx={6} />
          {mark(n.dir * (inner + 14), cy, n.done, 3)}
          <text x={n.dir * (inner + 26)} y={cy} textAnchor={anchor(n.dir)}>
            {n.dir > 0
              ? <>{n.label}{n.deep && <tspan className="deep" dx={6}>심화</tspan>}</>
              : <>{n.deep && <tspan className="deep">심화</tspan>}<tspan dx={n.deep ? 6 : 0}>{n.label}</tspan></>}
          </text>
        </g>
      );
    }
    case 'must': {
      const inner = n.dir > 0 ? x : -(x + w);
      return (
        <g className={`must b${n.b % 10}${n.done ? ' done' : ''}${n.on ? ' on' : ''}`} aria-label={`${n.label}${n.done ? ', 완료' : ''}`} {...common}>
          <rect x={x} y={y} width={w} height={h} rx={7} />
          {mark(n.dir * (inner + 14), cy, n.done)}
          <text x={n.dir * (inner + 26)} y={cy} textAnchor={anchor(n.dir)}>{n.label}</text>
        </g>
      );
    }
  }
}
