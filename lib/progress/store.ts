'use client';

import { useSyncExternalStore } from 'react';
import { migrateLegacy } from './migrate';

/** 완료한 개념 id를 담는 저장소. 나중에 서버 동기화 구현으로 바꿀 수 있게 인터페이스로 둔다 */
export interface ProgressStore {
  get(): ReadonlySet<string>;
  toggle(id: string): void;
  clear(): void;
  subscribe(fn: () => void): () => void;
}

const KEY = 'mindmap-progress-v2';
const EMPTY: ReadonlySet<string> = new Set();

function createLocalStore(): ProgressStore {
  let done: ReadonlySet<string> = EMPTY;
  let loaded = false;
  const subs = new Set<() => void>();
  const emit = () => subs.forEach(fn => fn());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...done])); } catch {} };

  function load() {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { done = new Set(JSON.parse(raw)); return; }
    } catch {}
    // v1 정적 사이트의 기록이 있으면 한 번만 새 id로 옮긴다
    migrateLegacy().then(ids => {
      if (!ids.length) return;
      done = new Set([...done, ...ids]);
      save();
      emit();
    });
  }

  return {
    get() { load(); return done; },
    toggle(id) {
      const next = new Set(done);
      if (next.has(id)) next.delete(id); else next.add(id);
      done = next;
      save();
      emit();
    },
    clear() { done = new Set(); save(); emit(); },
    subscribe(fn) {
      subs.add(fn);
      const onStorage = (e: StorageEvent) => { if (e.key === KEY) { loaded = false; load(); emit(); } };
      window.addEventListener('storage', onStorage);
      return () => { subs.delete(fn); window.removeEventListener('storage', onStorage); };
    },
  };
}

export const progress: ProgressStore = createLocalStore();

export function useProgress(): ReadonlySet<string> {
  return useSyncExternalStore(progress.subscribe, progress.get, () => EMPTY);
}
