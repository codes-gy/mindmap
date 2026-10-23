import { Header } from '@/components/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { skeletons } from '@/lib/content';

export default function Home() {
  return (
    <div className="wrap">
      <Header />
      <Dashboard tabs={skeletons()} current={null} />
      <p className="hint home-hint">위의 탭 카드를 누르면 그 탭의 마인드맵과 전체 노트가 열립니다.</p>
    </div>
  );
}
