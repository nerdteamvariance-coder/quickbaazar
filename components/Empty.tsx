import Link from 'next/link';

export function Empty({ title, text, cta, href }: { title: string; text: string; cta: string; href: string }) {
  return (
    <div className="empty view">
      <div className="o"><svg className="i" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2" /></svg></div>
      <h2>{title}</h2><p>{text}</p><Link className="btn" href={href}>{cta}</Link>
    </div>
  );
}
export function PageHead({ title, sub, crumb }: { title: string; sub?: string; crumb?: string }) {
  return (
    <><div className="crumb"><Link href="/">Home</Link> / {crumb || title}</div>
      <div className="phero"><h1 className="disp">{title}</h1>{sub && <p>{sub}</p>}</div></>
  );
}
