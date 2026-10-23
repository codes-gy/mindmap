import Link from 'next/link';
import type { Compare, Concept, Group } from '@/content/types';
import { locate } from '@/lib/content';
import { Reveal } from '@/components/QuizToggle';
import { Block, List, Rich } from './RichText';

export function CompareTable({ cmp, current }: { cmp: Compare; current?: string }) {
  const me = (k: number) => cmp.cols[k] === current ? 'me' : undefined;
  return (
    <div className="cmp">
      <table>
        <thead><tr>{cmp.cols.map((c, k) => <th key={k} className={me(k)}><Rich text={c} /></th>)}</tr></thead>
        <tbody>{cmp.rows.map((r, i) => <tr key={i}>{r.map((c, k) => k ? <td key={k} className={me(k)}><Rich text={c} /></td> : <th key={k}><Rich text={c} /></th>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export interface Parts { concept: React.ReactNode; practice: React.ReactNode | null; interview: React.ReactNode | null }

/** 개념 설명을 개념 / 코드·실무 / 면접 세 부분으로 나눈다 (v1의 docParts) */
export function conceptParts(c: Concept, group: Group | undefined, opts: { compare?: boolean; related?: boolean } = {}): Parts {
  const concept = (
    <>
      <p className="def"><Rich text={c.def} /></p>
      {c.analogy && <section className="ana"><h4>비유</h4><p><Rich text={c.analogy} /></p></section>}
      {c.why && <section><h4>왜 필요한가</h4><p><Rich text={c.why} /></p></section>}
      {c.how && <section><h4>{c.deep ? '동작 원리' : '설명'}</h4><Block lines={c.how} /></section>}
      {c.flow && <section><h4>흐름</h4><ol className="flow">{c.flow.map((s, i) => <li key={i}><Rich text={s} /></li>)}</ol></section>}
      {opts.compare !== false && group?.compare && <section><h4>같은 묶음 비교</h4><CompareTable cmp={group.compare} current={c.title} /></section>}
    </>
  );

  const hasPractice = c.code || c.use || c.warn || c.myth;
  const practice = hasPractice ? (
    <>
      {c.code && <section><h4>코드 예시</h4><pre><code className={`lang-${c.codeLang}`}>{c.code}</code></pre></section>}
      {c.use && <section><h4>실무 사례</h4><List items={c.use} /></section>}
      {c.warn && <section className="warn"><h4>주의할 점</h4><List items={c.warn} /></section>}
      {c.myth && <section><h4>흔한 오해</h4><ul className="myth">{c.myth.map(([m, f], i) => <li key={i}><span className="m"><Rich text={m} /></span><span className="f"><Rich text={f} /></span></li>)}</ul></section>}
    </>
  ) : null;

  const related = opts.related && c.related?.length ? c.related.map(id => locate(id)).filter(x => !!x) : [];
  const hasInterview = c.answer || c.qa || c.followUps || related.length;
  const tabKey = c.id.split('/')[0];
  const interview = hasInterview ? (
    <>
      {c.answer && <section className="ans"><h4>30초 답변</h4><Reveal label="30초 답변 보기"><p><Rich text={c.answer} /></p></Reveal></section>}
      {c.qa && <section className="qa"><h4>면접 질문</h4><p className="qtext"><Rich text={c.qa[0]} /></p><Reveal><p><Rich text={c.qa[1]} /></p></Reveal></section>}
      {c.followUps && (
        <section><h4>꼬리 질문</h4>
          <ol className="fq">{c.followUps.map(([q, a], i) => <li key={i}><p className="qtext"><Rich text={q} /></p><Reveal><p><Rich text={a} /></p></Reveal></li>)}</ol>
        </section>
      )}
      {related.length > 0 && (
        <section><h4>관련 개념</h4>
          <div className="rels">
            {related.map(r => r.tab.key === tabKey
              ? <Link key={r.concept.id} href={`/${r.tab.key}/${r.concept.slug}`} scroll={false}>{r.concept.title}</Link>
              // 다른 탭의 개념은 가로챈 라우트가 탭을 바꾸지 못하므로 일반 이동으로 단독 페이지를 연다
              : <a key={r.concept.id} href={`/${r.tab.key}/${r.concept.slug}`}>{r.concept.title}<small> · {r.tab.title}</small></a>)}
          </div>
        </section>
      )}
    </>
  ) : null;

  return { concept, practice, interview };
}

export function MustList({ items }: { items: string[] }) {
  return <ul>{items.map((m, i) => <li key={i}><Rich text={m} /></li>)}</ul>;
}
