// v1 정적 사이트의 완료 기록('탭|주제|묶음|개념')을 v2 id('탭/슬러그')로 옮긴다

const LEGACY_KEY = 'mindmap-done';

// v1 안에서도 CS 기초의 주제가 다른 탭으로 옮겨 갔으므로, 그 이름 변경을 먼저 적용한다
const DS_SPLIT: Record<string, string[]> = {
  '선형 · 해시': ['선형 구조', '스택 · 큐', '해시', '알아둘 것'],
  '트리 · 힙': ['트리', '힙 · 우선순위 큐', '디스크 기반 트리'],
  '그래프': ['그래프'],
};
const MOVED: [string, string][] = [
  ...Object.entries(DS_SPLIT).flatMap(([b, gs]) => gs.map(g => {
    const tail = g === '알아둘 것' ? '' : '|';
    return [`cs|자료구조|${g}${tail}`, `ds|${b}|${g}${tail}`] as [string, string];
  })),
  ['cs|알고리즘|', 'algo|핵심 알고리즘|'],
  ['cs|네트워크|', 'net|네트워크 기초|'],
  ['cs|네트워크 · 브라우저|', 'net|네트워크 · 브라우저|'],
  ['cs|실시간 통신 · 프로토콜|', 'net|실시간 통신 · 프로토콜|'],
];

export function applyMoves(key: string): string {
  const m = MOVED.find(([from]) => key.startsWith(from));
  return m ? m[1] + key.slice(m[0].length) : key;
}

export function mapLegacy(keys: string[], table: Record<string, string>): string[] {
  return keys.map(k => table[applyMoves(k)]).filter((id): id is string => !!id);
}

export async function migrateLegacy(): Promise<string[]> {
  let keys: string[];
  try { keys = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]'); } catch { return []; }
  if (!keys.length) return [];
  try {
    const table: Record<string, string> = await fetch('/legacy-progress-map.json').then(r => r.json());
    return mapLegacy(keys, table);
  } catch {
    return [];
  }
}
