'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { search, SEARCH_INDEX_URL, type SearchEntry } from '@/lib/search';

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return <>{text.split(re).map((p, i) => i % 2 ? <mark key={i}>{p}</mark> : p)}</>;
}

export function SearchResults() {
  const q = useSearchParams().get('q') ?? '';
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  useEffect(() => { fetch(SEARCH_INDEX_URL).then(r => r.json()).then(setEntries).catch(() => setEntries([])); }, []);
  const results = useMemo(() => entries ? search(entries, q) : [], [entries, q]);
  const words = q.trim().split(/\s+/).filter(Boolean);

  return (
    <section className="search-page" aria-live="polite">
      <h2>{q ? <>‘{q}’ 검색 결과</> : '개념 검색'}</h2>
      {!q && <p className="empty">위 검색창에 개념 이름이나 면접 질문의 낱말을 입력하세요.</p>}
      {q && entries === null && <p className="empty">검색 인덱스를 불러오는 중입니다.</p>}
      {q && entries && !results.length && <p className="empty">일치하는 개념이 없습니다.</p>}
      {results.length > 0 && (
        <ol className="results">
          {results.map(e => (
            <li key={e.href} className={`b${e.color}`}>
              <Link href={e.href}>
                <span className="r-title"><Highlight text={e.title} words={words} />{e.deep && <span className="tag">심화</span>}</span>
                <span className="r-path">{e.path}</span>
                <span className="r-def"><Highlight text={e.def} words={words} /></span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
