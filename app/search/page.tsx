import type { Metadata } from 'next';
import { Suspense } from 'react';
import { preload } from 'react-dom';
import { Header } from '@/components/Header';
import { SearchResults } from '@/components/SearchResults';
import { SEARCH_INDEX_URL } from '@/lib/search';

export const metadata: Metadata = { title: '검색', robots: { index: false } };

export default function SearchPage() {
  // 검색 인덱스를 화면 JS가 실행되기 전, HTML을 읽는 동안 받기 시작한다 (SearchResults의 fetch가 이 응답을 쓴다)
  preload(SEARCH_INDEX_URL, { as: 'fetch', crossOrigin: 'anonymous' });
  return (
    <div className="wrap">
      <Header />
      <Suspense fallback={<p className="empty">검색 준비 중입니다.</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
