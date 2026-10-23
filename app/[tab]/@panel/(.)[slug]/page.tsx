import { notFound } from 'next/navigation';
import { ConceptPanel } from '@/components/concept/ConceptPanel';
import { resolve } from '@/lib/view';
import { allSlugParams } from '@/lib/params';

// 마인드맵에서 개념을 누르면 이 라우트가 /[tab]/[slug]를 가로채 카드로 보여 준다
export const generateStaticParams = allSlugParams;

export default async function InterceptedConcept({ params }: PageProps<'/[tab]/[slug]'>) {
  const { tab, slug } = await params;
  const r = resolve(tab, slug);
  if (!r) notFound();
  return <ConceptPanel r={r} />;
}
