import { Fragment } from 'react';

/** 백틱으로 감싼 부분을 인라인 코드로 바꾼다 */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return <>{parts.map((p, i) => i % 2 ? <code key={i}>{p}</code> : <Fragment key={i}>{p}</Fragment>)}</>;
}

/** 설명 문단 배열을 그린다. `- 라벨: 내용`은 목록(라벨 굵게), `1) ...`은 단계 문단 */
export function Block({ lines }: { lines: string[] }) {
  const out: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`}>{list}</ul>); list = []; } };
  lines.forEach((l, i) => {
    if (l.startsWith('- ')) {
      const t = l.slice(2), m = t.match(/^(.{1,40}?): ([\s\S]*)$/);
      list.push(<li key={i}>{m ? <><b><Rich text={m[1]} /></b>: <Rich text={m[2]} /></> : <Rich text={t} />}</li>);
    } else {
      flush();
      out.push(<p key={i} className={/^\d+\)/.test(l) ? 'step' : undefined}><Rich text={l} /></p>);
    }
  });
  flush();
  return <>{out}</>;
}

export function List({ items, className }: { items: string[]; className?: string }) {
  return <ul className={className}>{items.map((x, i) => <li key={i}><Rich text={x} /></li>)}</ul>;
}
