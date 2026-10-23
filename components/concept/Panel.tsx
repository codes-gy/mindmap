'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQuiz } from '@/lib/quiz';
import { QuizToggle } from '@/components/QuizToggle';
import { DoneButton } from './DoneButton';

type PartKey = 'concept' | 'practice' | 'interview';
const LABELS: Record<PartKey, string> = { concept: '개념', practice: '코드 · 실무', interview: '면접' };

export interface PanelNav { prev: string; next: string; pos: string; close: string }

/** 마인드맵 위에 뜨는 설명 카드. 내용은 서버에서 그린 것을 받는다 */
export function Panel({ id, color, cat, title, parts, body, nav }: {
  id: string;
  color: number;
  cat: React.ReactNode;
  title: string;
  /** 개념: 세 부분으로 나눈 설명 */
  parts?: Partial<Record<PartKey, React.ReactNode>>;
  /** 알아둘 것: 탭 없이 한 덩어리 */
  body?: React.ReactNode;
  nav: PanelNav;
}) {
  const router = useRouter();
  const quiz = useQuiz();
  const ref = useRef<HTMLElement>(null);
  const available = parts ? (Object.keys(LABELS) as PartKey[]).filter(k => parts[k]) : [];
  const [picked, setPicked] = useState<PartKey | null>(null);
  const cur: PartKey = picked && available.includes(picked) ? picked : quiz && available.includes('interview') ? 'interview' : 'concept';

  useEffect(() => { ref.current?.scrollTo({ top: 0 }); }, [id]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.push(nav.close, { scroll: false }); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [router, nav.close]);

  return (
    <aside className={`panel b${color}`} ref={ref} aria-live="polite">
      <div className="top">
        <p className="cat">{cat}</p>
        <Link className="close" href={nav.close} scroll={false} aria-label="설명 닫기">×</Link>
      </div>
      <h2>{title}</h2>
      {parts && (
        <div className="ptabs" role="tablist" aria-label="설명 구분">
          {available.map(k => <button key={k} type="button" role="tab" aria-selected={k === cur} onClick={() => setPicked(k)}>{LABELS[k]}</button>)}
          <QuizToggle />
        </div>
      )}
      <div className="doc">{parts ? parts[cur] : body}</div>
      <DoneButton id={id} />
      {/* 기본 프리페치는 공통 껍데기만 받으므로, 바로 다음에 누를 이전·다음은 본문까지 받는다 */}
      <div className="nav">
        <Link href={nav.prev} scroll={false} replace prefetch>← 이전</Link>
        <span className="pos">{nav.pos}</span>
        <Link href={nav.next} scroll={false} replace prefetch>다음 →</Link>
      </div>
    </aside>
  );
}
