import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DoneButton } from '@/components/concept/DoneButton';
import { conceptParts, MustList } from '@/components/concept/sections';
import { QuizToggle } from '@/components/QuizToggle';
import { allSlugParams } from '@/lib/params';
import { mustTitle, resolve } from '@/lib/view';

// 개념 주소로 바로 들어오거나 새로고침하면 카드 대신 이 페이지를 그린다 (검색 엔진도 이 페이지를 본다)
export const generateStaticParams = allSlugParams;

export async function generateMetadata({ params }: PageProps<'/[tab]/[slug]'>): Promise<Metadata> {
  const { tab, slug } = await params;
  const r = resolve(tab, slug);
  if (!r) return {};
  if (r.kind === 'must') return { title: mustTitle(r.topic), description: r.topic.must.join(' ') };
  const c = r.located.concept;
  return {
    title: `${c.title} · ${r.tab.title}`,
    description: c.answer ?? c.def,
    alternates: { canonical: `/${r.tab.key}/${c.slug}` },
    openGraph: { title: c.title, description: c.def, type: 'article' },
  };
}

export default async function ConceptPage({ params }: PageProps<'/[tab]/[slug]'>) {
  const { tab, slug } = await params;
  const r = resolve(tab, slug);
  if (!r) notFound();
  const color = r.topicIndex % 10;

  if (r.kind === 'must') {
    return (
      <article className={`concept-page b${color}`} id="concept">
        <p className="cat"><Link href={`/${r.tab.key}`}>{r.tab.title}</Link> › {r.topic.name}</p>
        <h2>{mustTitle(r.topic)}</h2>
        <div className="doc"><MustList items={r.topic.must} /></div>
        <DoneButton id={r.id} />
        <PageNav nav={r.nav} />
      </article>
    );
  }

  const c = r.located.concept;
  const p = conceptParts(c, r.group, { related: true });
  return (
    <article className={`concept-page b${color}`} id="concept">
      <p className="cat">
        <Link href={`/${r.tab.key}`}>{r.tab.title}</Link> › {r.topic.name} › {r.group.name}
        {c.deep && <span className="tag">심화</span>}
      </p>
      <div className="concept-title">
        <h2>{c.title}</h2>
        <QuizToggle />
      </div>
      <section className="part"><h3>개념</h3><div className="doc">{p.concept}</div></section>
      {p.practice && <section className="part"><h3>코드 · 실무</h3><div className="doc">{p.practice}</div></section>}
      {p.interview && <section className="part"><h3>면접</h3><div className="doc">{p.interview}</div></section>}
      <DoneButton id={r.id} />
      <PageNav nav={r.nav} />
    </article>
  );
}

function PageNav({ nav }: { nav: { prev: string; next: string; pos: string } }) {
  return (
    <nav className="nav page-nav" aria-label="이전 · 다음 개념">
      <Link href={nav.prev}>← 이전</Link>
      <span className="pos">{nav.pos}</span>
      <Link href={nav.next}>다음 →</Link>
    </nav>
  );
}
