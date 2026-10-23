// 검색: 공백으로 나눈 낱말이 모두 들어 있는 항목을 찾고, 제목에 있을수록 앞에 둔다
export interface SearchEntry {
  href: string; title: string; tab: string; path: string; def: string; deep: boolean; color: number; extra: string;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ');

export function search(entries: SearchEntry[], query: string, limit = 50): SearchEntry[] {
  const words = norm(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const scored: [number, SearchEntry][] = [];
  for (const e of entries) {
    const title = norm(e.title), body = norm(`${e.path} ${e.def} ${e.extra}`);
    let score = 0;
    for (const w of words) {
      if (title === w) score += 100;
      else if (title.startsWith(w)) score += 40;
      else if (title.includes(w)) score += 25;
      else if (body.includes(w)) score += 5;
      else { score = -1; break; }
    }
    if (score > 0) scored.push([score + (e.deep ? 1 : 0), e]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map(([, e]) => e);
}
