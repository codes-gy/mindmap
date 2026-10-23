import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { SearchResults } from '@/components/SearchResults';

export const metadata: Metadata = { title: '검색', robots: { index: false } };

export default function SearchPage() {
  return (
    <div className="wrap">
      <Header />
      <Suspense fallback={<p className="empty">검색 준비 중입니다.</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
