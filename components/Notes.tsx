import Link from 'next/link';
import type { Tab } from '@/content/types';
import { MUST_TITLE, mustId } from '@/lib/content';
import { DoneBox, DoneCheck, TopicCount } from './concept/DoneButton';
import { CompareTable, conceptParts, MustList } from './concept/sections';

/** 전체 노트: 탭의 모든 개념 설명을 한 페이지에 펼친다 */
export function Notes({ tab }: { tab: Tab }) {
  return (
    <section>
      <div className="notes-head">
        <h2>전체 노트</h2>
        <p>지금 보고 있는 마인드맵의 모든 개념 설명입니다. 체크박스로 완료를 표시할 수 있습니다.</p>
      </div>
      <div className="notes">
        {tab.topics.map((tp, i) => {
          const must = mustId(tab.key, tp);
          const ids = [...tp.groups.flatMap(g => g.concepts.map(c => c.id)), must];
          return (
            <article key={tp.key} className={`topic b${i % 10}`}>
              <h3>{tp.name}<TopicCount ids={ids} /></h3>
              {tp.groups.map(g => (
                <div key={g.name} className="grp">
                  <h4>{g.name}</h4>
                  {g.compare && <div className="doc"><CompareTable cmp={g.compare} /></div>}
                  <div className="items">
                    {g.concepts.map(c => {
                      const p = conceptParts(c, g, { compare: false });
                      return (
                        <DoneBox key={c.id} id={c.id} className="item">
                          <div className="item-head">
                            <DoneCheck id={c.id} label={c.title} tag={c.deep} />
                            <Link className="permalink" href={`/${tab.key}/${c.slug}`} scroll={false} aria-label={`${c.title} 카드로 열기`}>열기</Link>
                          </div>
                          <div className="doc">{p.concept}</div>
                          {p.practice && <details className="more"><summary>코드 · 실무</summary><div className="doc">{p.practice}</div></details>}
                          {p.interview && <details className="more"><summary>면접</summary><div className="doc">{p.interview}</div></details>}
                        </DoneBox>
                      );
                    })}
                  </div>
                </div>
              ))}
              <DoneBox id={must} className="must-box">
                <DoneCheck id={must} label={MUST_TITLE} />
                <div className="doc"><MustList items={tp.must} /></div>
              </DoneBox>
            </article>
          );
        })}
      </div>
    </section>
  );
}
