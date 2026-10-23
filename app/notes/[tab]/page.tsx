import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Notes } from '@/components/Notes';
import { getTab, tabs } from '@/lib/content';

// 탭의 모든 개념 설명을 펼친 노트. 크기가 커서 탭 화면과 나눠 둔다
export function generateStaticParams() {
  return tabs().map(t => ({ tab: t.key }));
}

export async function generateMetadata({ params }: PageProps<'/notes/[tab]'>): Promise<Metadata> {
  const tab = getTab((await params).tab);
  return tab ? { title: `${tab.title} 전체 노트`, description: `${tab.title} 개념 ${tab.topics.length}개 주제의 설명을 한 페이지에 펼친 노트입니다.` } : {};
}

export default async function NotesPage({ params }: PageProps<'/notes/[tab]'>) {
  const tab = getTab((await params).tab);
  if (!tab) notFound();
  return (
    <div className="wrap">
      <Header />
      <p className="back"><Link href={`/${tab.key}`}>← {tab.title} 마인드맵으로</Link></p>
      <Notes tab={tab} full />
    </div>
  );
}
