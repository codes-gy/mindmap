'use client';

import { SEARCH_INDEX_URL } from '@/lib/search';

let warmed = false;

/** 검색창: 포커스를 받으면 검색 인덱스를 미리 받아 두어 결과 페이지에서 바로 쓰게 한다 */
export function SearchBox() {
  const warm = () => {
    if (warmed) return;
    warmed = true;
    fetch(SEARCH_INDEX_URL).catch(() => { warmed = false; });
  };
  return (
    <form action="/search" className="search-box" role="search">
      <input type="search" name="q" placeholder="개념 검색 (예: 트랜잭션, TCP, LIS)" aria-label="개념 검색" onFocus={warm} />
      <button type="submit">검색</button>
    </form>
  );
}
