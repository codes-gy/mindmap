// 콘텐츠 검사: 빌드 전에 실행해 깨진 데이터가 배포되지 않게 한다
import { TABS } from '../content/index.ts';

const errors: string[] = [];
const ids = new Set<string>();
let concepts = 0;

for (const tab of TABS) {
  const titles = new Set<string>();
  for (const topic of tab.topics) {
    if (!topic.key.startsWith(tab.key + '-')) errors.push(`${topic.key}: 주제 키가 탭 '${tab.key}'로 시작하지 않습니다`);
    if (!topic.must.length) errors.push(`${topic.key}: '알아둘 것'이 비어 있습니다`);
    for (const group of topic.groups) {
      if (!group.concepts.length) errors.push(`${topic.key} › ${group.name}: 개념이 없습니다`);
      if (group.compare) group.compare.rows.forEach((r, i) => {
        if (r.length !== group.compare!.cols.length) errors.push(`${topic.key} › ${group.name}: 비교 표 ${i + 1}행의 칸 수가 열 수와 다릅니다`);
      });
      for (const c of group.concepts) {
        concepts++;
        const where = `${c.id} (${c.title})`;
        if (c.id !== `${tab.key}/${c.slug}`) errors.push(`${where}: id가 '${tab.key}/${c.slug}'와 다릅니다`);
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)) errors.push(`${where}: 슬러그 형식이 잘못되었습니다`);
        if (ids.has(c.id)) errors.push(`${where}: id가 중복됩니다`);
        if (titles.has(c.title)) errors.push(`${where}: 같은 탭에 같은 제목이 있습니다`);
        if (!c.def?.trim()) errors.push(`${where}: 정의(def)가 비어 있습니다`);
        ids.add(c.id); titles.add(c.title);
      }
    }
  }
}
for (const tab of TABS) for (const topic of tab.topics) for (const group of topic.groups) for (const c of group.concepts) {
  for (const r of c.related ?? []) if (!ids.has(r)) errors.push(`${c.id}: 관련 개념 '${r}'가 없습니다`);
}

if (errors.length) {
  console.error(`콘텐츠 검사 실패 (${errors.length}건)\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`콘텐츠 검사 통과: 탭 ${TABS.length}개 · 주제 ${TABS.reduce((s, t) => s + t.topics.length, 0)}개 · 개념 ${concepts}개`);
