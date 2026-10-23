import type { Resolved } from '@/lib/view';
import { mustTitle } from '@/lib/view';
import { Panel } from './Panel';
import { conceptParts, MustList } from './sections';

/** 마인드맵 위 설명 카드 (가로챈 라우트에서 쓴다) */
export function ConceptPanel({ r }: { r: Resolved }) {
  const color = r.topicIndex % 10;
  if (r.kind === 'must') {
    return <Panel id={r.id} color={color} cat={r.topic.name} title={mustTitle(r.topic)} body={<MustList items={r.topic.must} />} nav={r.nav} />;
  }
  const c = r.located.concept;
  const parts = conceptParts(c, r.group, { related: true });
  return (
    <Panel
      id={r.id}
      color={color}
      cat={<>{r.topic.name} › {r.group.name}{c.deep && <span className="tag">심화</span>}</>}
      title={c.title}
      parts={{ concept: parts.concept, ...(parts.practice ? { practice: parts.practice } : {}), ...(parts.interview ? { interview: parts.interview } : {}) }}
      nav={r.nav}
    />
  );
}
