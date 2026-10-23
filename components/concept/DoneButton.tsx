'use client';

import { progress, useProgress } from '@/lib/progress/store';

export function DoneButton({ id }: { id: string }) {
  const done = useProgress().has(id);
  return (
    <button type="button" className="done-btn" aria-pressed={done} onClick={() => progress.toggle(id)}>
      {done ? '✓ 학습 완료 (누르면 취소)' : '학습 완료로 표시'}
    </button>
  );
}

export function DoneCheck({ id, label, tag }: { id: string; label: string; tag?: boolean }) {
  const done = useProgress().has(id);
  return (
    <label className="check">
      <input type="checkbox" checked={done} onChange={() => progress.toggle(id)} />
      {label}{tag && <span className="tag">심화</span>}
    </label>
  );
}

/** 노트의 개념 상자: 완료하면 강조한다 */
export function DoneBox({ id, className, children }: { id: string; className: string; children: React.ReactNode }) {
  const done = useProgress().has(id);
  return <div className={`${className}${done ? ' done' : ''}`}>{children}</div>;
}

export function TopicCount({ ids }: { ids: string[] }) {
  const done = useProgress();
  return <span className="num">{ids.filter(id => done.has(id)).length}/{ids.length} 완료</span>;
}
