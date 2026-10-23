'use client';

import { useSyncExternalStore } from 'react';

// 자기 점검 모드: 켜면 답변이 가려지고 눌러야 보인다. v1과 같은 키를 써서 설정을 이어받는다
const KEY = 'mindmap-quiz';
const subs = new Set<() => void>();
let on: boolean | null = null;

function get(): boolean {
  if (on === null) { try { on = localStorage.getItem(KEY) === '1'; } catch { on = false; } }
  return on;
}

export function setQuiz(next: boolean) {
  on = next;
  try { localStorage.setItem(KEY, next ? '1' : '0'); } catch {}
  subs.forEach(fn => fn());
}

export function useQuiz(): boolean {
  return useSyncExternalStore(fn => { subs.add(fn); return () => subs.delete(fn); }, get, () => false);
}
