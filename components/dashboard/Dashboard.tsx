'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { SkeletonTab } from '@/lib/content';
import { progress, useProgress } from '@/lib/progress/store';
import { mapActions } from '@/components/mindmap/state';

const MUST_TITLE = '알아둘 것';
const pct = (a: number, b: number) => b ? Math.round(a / b * 100) : 0;
// 이전 탭의 화면이 숨겨진 채 남아 있을 수 있으므로 보이는 마인드맵을 찾는다
const visibleMap = () => [...document.querySelectorAll<HTMLElement>('.map-box')].find(el => el.offsetParent !== null);
const Bar = ({ p }: { p: number }) => <div className="bar"><i style={{ width: `${p}%` }} /></div>;

function stats(tab: SkeletonTab, done: ReadonlySet<string>) {
  const s = { total: 0, done: 0, cTotal: 0, cDone: 0, dTotal: 0, dDone: 0, mTotal: tab.topics.length, mDone: 0, topics: [] as { i: number; name: string; total: number; done: number }[] };
  tab.topics.forEach((t, i) => {
    let n = 1, d = done.has(t.must) ? 1 : 0;
    if (d) s.mDone++;
    for (const g of t.groups) for (const c of g.concepts) {
      const ok = done.has(c.id);
      n++; s.cTotal++;
      if (ok) { d++; s.cDone++; }
      if (c.deep) { s.dTotal++; if (ok) s.dDone++; }
    }
    s.total += n; s.done += d;
    s.topics.push({ i, name: t.name, total: n, done: d });
  });
  return s;
}

export function Dashboard({ tabs, current }: { tabs: SkeletonTab[]; current: string | null }) {
  const done = useProgress();
  const [asking, setAsking] = useState(false);
  const st = useMemo(() => tabs.map(t => stats(t, done)), [tabs, done]);
  const sum = (f: 'done' | 'total' | 'cDone' | 'cTotal' | 'dDone' | 'dTotal' | 'mDone' | 'mTotal') => st.reduce((a, s) => a + s[f], 0);
  const op = pct(sum('done'), sum('total'));
  const ci = tabs.findIndex(t => t.key === current);
  const cur = ci >= 0 ? tabs[ci] : null;

  // 심화 개념을 먼저 추천하고, 나머지는 순서대로
  const next = useMemo(() => {
    if (!cur) return [];
    const items = cur.topics.flatMap((t, i) => [
      ...t.groups.flatMap(g => g.concepts.map(c => ({ i, href: `/${cur.key}/${c.slug}`, id: c.id, title: c.title, sub: `${t.name} › ${g.name}`, deep: c.deep }))),
      { i, href: `/${cur.key}/must-${t.key}`, id: t.must, title: `${t.name}에서 ${MUST_TITLE}`, sub: t.name, deep: false },
    ]).filter(x => !done.has(x.id));
    return [...items.filter(x => x.deep), ...items.filter(x => !x.deep)].slice(0, 5);
  }, [cur, done]);

  return (
    <section className="dash" aria-labelledby="dashTitle">
      <div className="dash-head">
        <h2 id="dashTitle">학습 현황</h2>
        <div className="reset">
          <span>완료 기록은 이 브라우저에 저장됩니다.</span>
          {asking
            ? <span>모든 완료 기록을 지울까요?{' '}
                <button type="button" className="danger" onClick={() => { progress.clear(); setAsking(false); }}>지우기</button>{' '}
                <button type="button" onClick={() => setAsking(false)}>취소</button>
              </span>
            : <button type="button" onClick={() => setAsking(true)}>기록 초기화</button>}
        </div>
      </div>

      <div className="dash-top">
        <div className="overall">
          <p className="label">전체 진도</p>
          <div className="big num">{op}<small>%</small></div>
          <Bar p={op} />
          <p className="sub-line num">{sum('done')} / {sum('total')}개 완료 · 개념 {sum('cDone')}/{sum('cTotal')} · 심화 {sum('dDone')}/{sum('dTotal')} · {MUST_TITLE} {sum('mDone')}/{sum('mTotal')}</p>
        </div>
        {tabs.map((t, k) => {
          const s = st[k], p = pct(s.done, s.total), full = s.topics.filter(x => x.done === x.total).length;
          return (
            <Link key={t.key} href={`/${t.key}`} className="mapcard" aria-current={t.key === current ? 'page' : undefined} scroll={false}>
              <span className="row"><span className="name">{t.title}</span><span className="pct num">{p}%</span></span>
              <Bar p={p} />
              <span className="sub-line num">개념 {s.cDone}/{s.cTotal} · 심화 {s.dDone}/{s.dTotal}</span>
              <span className="sub-line num">{MUST_TITLE} {s.mDone}/{s.mTotal} · 끝낸 주제 {full}/{s.topics.length}</span>
            </Link>
          );
        })}
      </div>

      {cur && (
        <div className="dash-bottom">
          <div className="panel-box">
            <h3>{cur.title} 주제별 진도</h3>
            <div className="topics">
              {st[ci].topics.map(t => {
                const p = pct(t.done, t.total), full = t.done === t.total;
                return (
                  <button key={t.i} type="button" className={`topic-row b${t.i % 10}${full ? ' full' : ''}`} title={`${t.name}: ${t.done}/${t.total} 완료 (${p}%)`}
                    onClick={() => { mapActions.reveal(cur.key, t.i); visibleMap()?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                    <span className="dot" /><span className="tname">{t.name}</span><span className="cnt num">{full ? '✓ ' : ''}{t.done}/{t.total}</span><Bar p={p} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="panel-box">
            <h3>다음에 볼 개념</h3>
            <ul className="next-list">
              {next.length
                ? next.map(x => (
                    <li key={x.id}>
                      <Link href={x.href} className={`b${x.i % 10}`} scroll={false} prefetch>
                        <span className="dot" /><span className="t">{x.title}<small>{x.sub}</small></span>
                        {x.deep ? <span className="tag">심화</span> : <span />}
                      </Link>
                    </li>
                  ))
                : <li><p className="empty">{cur.title}의 모든 항목을 완료했습니다.</p></li>}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
