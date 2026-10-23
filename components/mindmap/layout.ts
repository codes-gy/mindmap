// 마인드맵 배치 계산. 화면과 무관한 순수 함수라 단위 테스트할 수 있다 (v1의 render()를 옮긴 것)
import type { SkeletonTab } from '@/lib/content';

export const MUST_TITLE = '알아둘 것';
const ROW = 34, GAP = 18, BR_H = 34, G_H = 26, CROW = 30, C_H = 24;
export const SIZES = { BR_H, G_H, C_H };

export type Measure = (text: string, font: string, mono?: boolean) => number;

export interface ViewState {
  collapsed: ReadonlySet<number>;     // 접힌 주제 인덱스
  expanded: ReadonlySet<string>;      // 펼친 묶음 `${주제}-${묶음}`
  done: ReadonlySet<string>;
  selected: string | null;            // 선택한 개념 id (또는 알아둘 것 id)
}

interface Box { x: number; y: number; w: number; h: number }
export type MapNode =
  | { kind: 'root'; label: string; box: Box }
  | { kind: 'branch'; b: number; dir: 1 | -1; label: string; count: string; collapsed: boolean; box: Box }
  | { kind: 'group'; b: number; g: number; dir: 1 | -1; label: string; count: string; open: boolean; full: boolean; box: Box }
  | { kind: 'concept'; b: number; id: string; slug: string; dir: 1 | -1; label: string; deep: boolean; done: boolean; on: boolean; box: Box }
  | { kind: 'must'; b: number; id: string; slug: string; dir: 1 | -1; label: string; done: boolean; on: boolean; box: Box };
export interface MapEdge { b: number; d: string; level: 'root' | 'group' | 'concept' }
export interface MapLayout { nodes: MapNode[]; edges: MapEdge[]; viewBox: [number, number, number, number] }

const curve = (x0: number, y0: number, x1: number, y1: number) => {
  const m = (x0 + x1) / 2;
  return `M${x0},${y0} C${m},${y0} ${m},${y1} ${x1},${y1}`;
};

export function topicCount(t: SkeletonTab['topics'][number], done: ReadonlySet<string>): [number, number] {
  let d = 0, n = 1;
  if (done.has(t.must)) d++;
  for (const g of t.groups) for (const c of g.concepts) { n++; if (done.has(c.id)) d++; }
  return [d, n];
}

export function layoutMap(tab: SkeletonTab, s: ViewState, measure: Measure): MapLayout {
  const T = tab.topics;
  const rootW = Math.max(measure(tab.root, '700 20px') + 52, 96);
  const brIn = rootW / 2 + 60;
  const half = Math.ceil(T.length / 2), all = T.map((_, i) => i);
  const sides: { dir: 1 | -1; idx: number[] }[] = [{ dir: 1, idx: all.slice(0, half) }, { dir: -1, idx: all.slice(half) }];
  const edges: MapEdge[] = [], nodes: MapNode[] = [];
  let minX = -rootW / 2, maxX = rootW / 2, maxH = BR_H;
  const grow = (dir: number, x: number) => { if (dir > 0) maxX = Math.max(maxX, x); else minX = Math.min(minX, -x); };
  const groupH = (i: number, g: number) => s.expanded.has(`${i}-${g}`) ? Math.max(ROW, T[i].groups[g].concepts.length * CROW + 8) : ROW;
  const left = (dir: number, inner: number, w: number) => dir > 0 ? inner : -inner - w;

  for (const { dir, idx } of sides) {
    if (!idx.length) continue;
    const counts = idx.map(i => { const [d, n] = topicCount(T[i], s.done); return (d === n ? '✓ ' : '') + `${d}/${n}`; });
    const widths = idx.map((i, k) => measure(T[i].name, '600 14px') + 8 + measure(counts[k], '500 12px', true) + 34);
    const gIn = brIn + Math.max(...widths) + 56;
    const heights = idx.map(i => s.collapsed.has(i) ? ROW : T[i].groups.reduce((h, _, g) => h + groupH(i, g), 0) + ROW);
    const total = heights.reduce((a, b) => a + b, 0) + GAP * (idx.length - 1);
    maxH = Math.max(maxH, total);
    let y = -total / 2;

    idx.forEach((i, k) => {
      const h = heights[k], w = widths[k], by = y + h / 2, isC = s.collapsed.has(i);
      edges.push({ b: i, level: 'root', d: curve(dir * rootW / 2, 0, dir * brIn, by) });
      nodes.push({ kind: 'branch', b: i, dir, label: T[i].name, count: counts[k], collapsed: isC, box: { x: left(dir, brIn, w), y: by - BR_H / 2, w, h: BR_H } });
      grow(dir, brIn + w + (isC ? 60 : 0));

      if (!isC) {
        const ox = dir * (brIn + w);
        let gy0 = y;
        T[i].groups.forEach((gr, g) => {
          const gh = groupH(i, g), gy = gy0 + gh / 2, open = s.expanded.has(`${i}-${g}`);
          const d = gr.concepts.filter(c => s.done.has(c.id)).length, n = gr.concepts.length;
          const count = `${d}/${n}`;
          const gw = measure(gr.name, '600 13.5px') + 8 + measure(count, '500 11px', true) + 44;
          edges.push({ b: i, level: 'group', d: curve(ox, by, dir * gIn, gy) });
          nodes.push({ kind: 'group', b: i, g, dir, label: gr.name, count, open, full: d === n, box: { x: left(dir, gIn, gw), y: gy - G_H / 2, w: gw, h: G_H } });
          grow(dir, gIn + gw);

          if (open) {
            const n2 = gr.concepts.length, cx = dir * (gIn + gw), cIn = gIn + gw + 40;
            gr.concepts.forEach((c, ci) => {
              const cy = gy - n2 * CROW / 2 + ci * CROW + CROW / 2;
              const tagW = c.deep ? measure('심화', '500 10px', true) + 8 : 0;
              const cw = measure(c.title, '400 12.5px') + tagW + 40;
              edges.push({ b: i, level: 'concept', d: curve(cx, gy, dir * cIn, cy) });
              nodes.push({ kind: 'concept', b: i, id: c.id, slug: c.slug, dir, label: c.title, deep: c.deep, done: s.done.has(c.id), on: s.selected === c.id, box: { x: left(dir, cIn, cw), y: cy - C_H / 2, w: cw, h: C_H } });
              grow(dir, cIn + cw);
            });
          }
          gy0 += gh;
        });

        const my = gy0 + ROW / 2, mlabel = `${MUST_TITLE} · ${T[i].mustCount}`;
        const mw = measure(mlabel, '700 13px') + 40;
        edges.push({ b: i, level: 'group', d: curve(ox, by, dir * gIn, my) });
        nodes.push({ kind: 'must', b: i, id: T[i].must, slug: `must-${T[i].key}`, dir, label: mlabel, done: s.done.has(T[i].must), on: s.selected === T[i].must, box: { x: left(dir, gIn, mw), y: my - G_H / 2, w: mw, h: G_H } });
        grow(dir, gIn + mw);
      }
      y += h + GAP;
    });
  }

  nodes.push({ kind: 'root', label: tab.root, box: { x: -rootW / 2, y: -24, w: rootW, h: 48 } });
  const pad = 24;
  return { nodes, edges, viewBox: [minX - pad, -maxH / 2 - pad, maxX - minX + pad * 2, maxH + pad * 2] };
}
