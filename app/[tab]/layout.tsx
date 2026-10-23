import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { MindMap } from '@/components/mindmap/MindMap';
import { getTab, skeleton, skeletons, tabs } from '@/lib/content';

export function generateStaticParams() {
  return tabs().map(t => ({ tab: t.key }));
}

export default async function TabLayout({ children, panel, params }: LayoutProps<'/[tab]'>) {
  const { tab: key } = await params;
  const tab = getTab(key);
  if (!tab) notFound();
  return (
    <>
      <div className="wrap">
        <Header />
        <Dashboard tabs={skeletons()} current={tab.key} />
        <MindMap tab={skeleton(tab)} tabs={tabs().map(t => ({ key: t.key, title: t.title }))} />
        <p className="hint">주제를 누르면 접고 펼치고, 묶음을 누르면 그 안의 개념이 가지로 펼쳐집니다. 개념을 누르면 개념 · 코드·실무 · 면접 탭으로 나뉜 설명 카드가 열리고 주소도 그 개념으로 바뀝니다. 자기 점검 모드를 켜면 답변이 가려집니다. &quot;심화&quot; 표시는 면접 빈출 개념, 체크 표시는 완료한 개념입니다.</p>
        {children}
      </div>
      {panel}
    </>
  );
}
