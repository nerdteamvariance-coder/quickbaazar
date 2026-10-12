import Link from 'next/link';
import { db } from '@/lib/store';
import { PageHead } from '@/components/Empty';
import Pic from '@/components/Pic';
import { grad } from '@/lib/util';

export const metadata = { title: 'Blog' };
export const dynamic = 'force-dynamic';
export default function Blog() {
  const posts = db().blogs.filter(b => b.published).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <div className="view"><PageHead title="The QuickBaazar journal" sub="Style guides, size help and what’s new." crumb="Blog" />
      {!posts.length && <p style={{ color: 'var(--mute)' }}>No posts yet — check back soon.</p>}
      <div className="pg c3">{posts.map((b, i) => (
        <Link key={b.id} href={`/blog/${b.slug}`} className="pn" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ aspectRatio: '16/10', background: grad(i), position: 'relative' }}>{b.image && <Pic k={b.image} w={800} />}</div>
          <div style={{ padding: 18 }}><span className="kick">{b.tags.split(',')[0] || 'Journal'}</span><h3>{b.title}</h3><p>{b.excerpt}</p>
            <small style={{ color: 'var(--mute)' }}>{b.author} · {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
        </Link>))}</div>
    </div>
  );
}
