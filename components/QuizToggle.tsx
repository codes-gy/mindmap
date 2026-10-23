'use client';

import { setQuiz, useQuiz } from '@/lib/quiz';

export function QuizToggle({ className = '' }: { className?: string }) {
  const quiz = useQuiz();
  return (
    <button type="button" className={`quiz-toggle ${className}`} aria-pressed={quiz} onClick={() => setQuiz(!quiz)}>
      {quiz ? '자기 점검 켜짐' : '자기 점검 모드'}
    </button>
  );
}

/** 자기 점검 모드에서는 답변을 접어 두고, 눌러야 보이게 한다 */
export function Reveal({ label = '답 보기', children }: { label?: string; children: React.ReactNode }) {
  const quiz = useQuiz();
  return quiz ? <details className="reveal"><summary>{label}</summary>{children}</details> : <>{children}</>;
}
