import Link from 'next/link';
import type { Tab } from '@/content/types';
import { MUST_TITLE, mustId } from '@/lib/content';
import { DoneBox, DoneCheck, TopicCount } from './concept/DoneButton';
import { CompareTable, conceptParts, MustList } from './concept/sections';

/**
 * 탭의 개념 노트. 기본은 제목과 완료 체크만 담은 목차이고, full이면 모든 개념 설명을 한 페이지에 펼친다.
 * 탭 화면에 설명까지 담으면 탭을 옮길 때마다 수 MB를 받으므로 전체 노트는 /notes/[tab]에서만 그린다
 */
export function Notes({ tab, full = false }: { tab: Tab; full?: boolean }) {
  return (
    <section>
      <div className="notes-head">
        <h2>{full ? `${tab.title} 전체 노트` : '개념 목록'}</h2>
        {full
          ? <p>{tab.title}의 모든 개념 설명입니다. 체크박스로 완료를 표시할 수 있습니다.</p>
          : <p>
              지금 보고 있는 마인드맵의 모든 개념입니다. 체크박스로 완료를 표시하고, 열기를 누르면 설명 카드가 열립니다.{' '}
              {/* 전체 노트는 크므로 미리 받지 않고, 개념 카드 가로채기((.)[slug])에 걸리지 않도록 새로 연다 */}
              <a href={`/notes/${tab.key}`}>설명까지 한 페이지에 펼친 전체 노트 보기 →</a>
            </p>}
      </div>
      <div className={full ? 'notes' : 'notes compact'}>
        {tab.topics.map((tp, i) => {
          const must = mustId(tab.key, tp);
          const ids = [...tp.groups.flatMap(g => g.concepts.map(c => c.id)), must];
          return (
            <article key={tp.key} className={`topic b${i % 10}`}>
              <h3>{tp.name}<TopicCount ids={ids} /></h3>
              {tp.groups.map(g => (
                <div key={g.name} className="grp">
                  <h4>{g.name}</h4>
                  {full && g.compare && <div className="doc"><CompareTable cmp={g.compare} /></div>}
                  <div className="items">
                    {g.concepts.map(c => {
                      const p = full ? conceptParts(c, g, { compare: false }) : null;
                      return (
                        <DoneBox key={c.id} id={c.id} className="item">
                          <div className="item-head">
                            <DoneCheck id={c.id} label={c.title} tag={c.deep} />
                            <OpenLink full={full} href={`/${tab.key}/${c.slug}`} label={`${c.title} 카드로 열기`} />
                          </div>
                          {p && <div className="doc">{p.concept}</div>}
                          {p?.practice && <details className="more"><summary>코드 · 실무</summary><div className="doc">{p.practice}</div></details>}
                          {p?.interview && <details className="more"><summary>면접</summary><div className="doc">{p.interview}</div></details>}
                        </DoneBox>
                      );
                    })}
                  </div>
                </div>
              ))}
              <DoneBox id={must} className="must-box">
                <div className="item-head">
                  <DoneCheck id={must} label={MUST_TITLE} />
                  <OpenLink full={full} href={`/${tab.key}/must-${tp.key}`} label={`${tp.name}에서 ${MUST_TITLE} 카드로 열기`} />
                </div>
                {full && <div className="doc"><MustList items={tp.must} /></div>}
              </DoneBox>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// /notes/[tab]에서 Link로 옮기면 개념 카드 가로채기((.)[slug])가 /notes를 탭으로 읽어 404가 나므로 단독 페이지를 새로 연다
function OpenLink({ full, href, label }: { full: boolean; href: string; label: string }) {
  return full
    ? <a className="permalink" href={href} aria-label={label}>열기</a>
    : <Link className="permalink" href={href} scroll={false} aria-label={label}>열기</Link>;
}
