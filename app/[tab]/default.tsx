import { notFound } from 'next/navigation';
import { Notes } from '@/components/Notes';
import { getTab } from '@/lib/content';

// 다른 탭의 개념 카드로 바로 넘어가면(가로챈 이동) 본문 자리에 그 탭의 노트를 보여 준다
export default async function TabDefault({ params }: { params: Promise<{ tab: string }> }) {
  const tab = getTab((await params).tab);
  if (!tab) notFound();
  return <Notes tab={tab} />;
}
