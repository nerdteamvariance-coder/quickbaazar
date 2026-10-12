import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/store';
import Pic from '@/components/Pic';
import { grad } from '@/lib/util';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const b = db().blogs.find(x => x.slug === slug && x.published); return { title: b?.title || 'Blog', description: b?.excerpt }; }
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const b = db().blogs.find(x => x.slug === slug && x.published); if (!b) notFound();
  return (
    <article className="view" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="crumb"><Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / {b.title}</div>
      <div className="phero"><span className="kick">{b.tags}</span><h1 className="disp">{b.title}</h1><p>{b.author} · {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
      {b.image && <div style={{ aspectRatio: '16/9', borderRadius: 22, overflow: 'hidden', background: grad(b.id), margin: '10px 0 24px', position: 'relative' }}><Pic k={b.image} w={1400} /></div>}
      {b.content.split(/\n{2,}/).map((para, i) => <p key={i} style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 18 }}>{para}</p>)}
      <Link className="btn" href="/shop/all">Shop the edit</Link>
    </article>
  );
}
