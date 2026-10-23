import { describe, expect, it } from 'vitest';
import { slugify } from '@/lib/slug';
import { applyMoves, mapLegacy } from '@/lib/progress/migrate';
import { search, type SearchEntry } from '@/lib/search';
import { layoutMap } from '@/components/mindmap/layout';
import { getTab, skeleton } from '@/lib/content';
import { hrefOf, resolve } from '@/lib/view';

describe('slugify', () => {
  it('한글은 로마자로, 기호는 하이픈으로 바꾼다', () => {
    expect(slugify('동적 계획법')).toBe('dongjeok-gyehoekbeop');
    expect(slugify('TCP/IP 4계층')).toBe('tcp-ip-4gyecheung');
    expect(slugify('B+Tree')).not.toBe(slugify('B-Tree'));
    expect(slugify('3-way handshake')).toBe('3-way-handshake');
  });
});

describe('v1 기록 이전', () => {
  it('CS 기초에서 옮겨 간 주제 이름을 먼저 바꾼다', () => {
    expect(applyMoves('cs|자료구조|트리|AVL 트리')).toBe('ds|트리 · 힙|트리|AVL 트리');
    expect(applyMoves('cs|자료구조|알아둘 것')).toBe('ds|선형 · 해시|알아둘 것');
    expect(applyMoves('cs|운영체제|데드락|데드락')).toBe('cs|운영체제|데드락|데드락');
  });
  it('표에 없는 키는 버린다', () => {
    expect(mapLegacy(['cs|네트워크|전송 계층|TCP', 'x|y'], { 'net|네트워크 기초|전송 계층|TCP': 'net/tcp' })).toEqual(['net/tcp']);
  });
});

describe('search', () => {
  const e = (title: string, def = ''): SearchEntry => ({ href: `/x/${title}`, title, tab: 'x', path: 'x', def, deep: false, color: 0, extra: '' });
  it('제목 일치를 본문 일치보다 앞에 둔다', () => {
    const r = search([e('UDP', 'TCP와 달리'), e('TCP')], 'tcp');
    expect(r.map(x => x.title)).toEqual(['TCP', 'UDP']);
  });
  it('모든 낱말이 들어 있어야 한다', () => {
    expect(search([e('트랜잭션 격리 수준'), e('트랜잭션')], '트랜잭션 격리').map(x => x.title)).toEqual(['트랜잭션 격리 수준']);
  });
});

describe('layoutMap', () => {
  const tab = skeleton(getTab('net')!);
  const measure = (t: string) => t.length * 8;
  const base = { collapsed: new Set<number>(), expanded: new Set<string>(), done: new Set<string>(), selected: null };
  it('주제를 좌우로 나누고 묶음과 알아둘 것을 그린다', () => {
    const m = layoutMap(tab, base, measure);
    const branches = m.nodes.filter(n => n.kind === 'branch');
    expect(branches).toHaveLength(6);
    expect(branches.filter(n => n.kind === 'branch' && n.dir === 1)).toHaveLength(3);
    expect(m.nodes.filter(n => n.kind === 'must')).toHaveLength(6);
    expect(m.nodes.filter(n => n.kind === 'concept')).toHaveLength(0);
  });
  it('펼친 묶음의 개념과 완료 표시를 그린다', () => {
    const m = layoutMap(tab, { ...base, expanded: new Set(['0-1']), done: new Set(['net/tcp']), selected: 'net/tcp' }, measure);
    const tcp = m.nodes.find(n => n.kind === 'concept' && n.id === 'net/tcp');
    expect(tcp).toMatchObject({ done: true, on: true });
  });
  it('접은 주제는 묶음을 그리지 않는다', () => {
    const m = layoutMap(tab, { ...base, collapsed: new Set([0, 1, 2, 3, 4, 5]) }, measure);
    expect(m.nodes.filter(n => n.kind === 'group')).toHaveLength(0);
  });
});

describe('resolve', () => {
  it('개념과 알아둘 것의 주소와 이전·다음을 계산한다', () => {
    const r = resolve('net', 'tcp')!;
    expect(r.kind).toBe('concept');
    expect(r.nav.next).toBe('/net/udp');
    expect(hrefOf('ds/~ds-1')).toBe('/ds/must-ds-1');
    expect(resolve('ds', 'must-ds-1')?.kind).toBe('must');
    expect(resolve('net', 'nope')).toBeUndefined();
  });
});
