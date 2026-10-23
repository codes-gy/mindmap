import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Notes } from '@/components/Notes';
import { getTab } from '@/lib/content';

export async function generateMetadata({ params }: PageProps<'/[tab]'>): Promise<Metadata> {
  const tab = getTab((await params).tab);
  return tab ? { title: tab.title, description: `${tab.title} 개념 ${tab.topics.length}개 주제를 마인드맵과 노트로 정리했습니다.` } : {};
}

export default async function TabPage({ params }: PageProps<'/[tab]'>) {
  const tab = getTab((await params).tab);
  if (!tab) notFound();
  return <Notes tab={tab} />;
}
