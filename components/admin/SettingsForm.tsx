'use client';
import { useState } from 'react';

type S = { storeName: string; freeShipAbove: number; shippingFee: number; supportEmail: string; supportPhone: string; announcements: string; gtmId: string; ga4Id: string; metaPixelId: string; abandonAfterMin: number; lowStockAt: number; recoveryMessage: string };
export default function SettingsForm({ initial }: { initial: S }) {
  const [s, setS] = useState<S>(initial); const [errs, setErrs] = useState<Record<string, string>>({}); const [msg, setMsg] = useState<{ m: string; bad?: boolean } | null>(null); const [busy, setBusy] = useState(false);
  const set = (k: keyof S) => (e: React.ChangeEvent<any>) => setS({ ...s, [k]: e.target.value });
  const say = (m: string, bad = false) => { setMsg({ m, bad }); setTimeout(() => setMsg(null), 2600); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErrs({});
    const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); const j = await r.json().catch(() => ({}));
    setBusy(false); if (r.ok) say('Settings saved'); else { setErrs(j.fields || {}); say(j.error || 'Could not save', true); }
  };
  const F = ({ k, label, type = 'text', help, ph }: { k: keyof S; label: string; type?: string; help?: string; ph?: string }) => (
    <div className={'f' + (errs[k] ? ' err' : '')}><label>{label}</label><input type={type} value={s[k] as any} placeholder={ph} onChange={set(k)} />{errs[k] ? <span className="em">{errs[k]}</span> : help ? <span className="hp">{help}</span> : null}</div>);
  const grid = { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' } as const;
  return (
    <>
      <div className="tbar"><h1>Settings</h1></div>
      <form style={{ maxWidth: 820, display: 'grid', gap: 18 }} onSubmit={save}>
        <div className="panel" style={{ marginTop: 0 }}><h2>Store</h2>
          <div style={grid}><F k="storeName" label="Store name" /><F k="supportEmail" label="Support email" /><F k="supportPhone" label="Support phone" />
            <F k="freeShipAbove" label="Free delivery above (₹)" type="number" help="Applies to the cart and checkout." /><F k="shippingFee" label="Delivery fee below that (₹)" type="number" /></div>
          <div className="f" style={{ marginTop: 16 }}><label>Announcement bar</label><textarea value={s.announcements} onChange={set('announcements')} /><span className="hp">One message per line. They scroll across the top of the store.</span></div></div>
        <div className="panel" style={{ marginTop: 0 }}><h2>Tracking & analytics</h2>
          <div style={grid}><F k="gtmId" label="Google Tag Manager ID" ph="GTM-XXXXXXX" help="Recommended. Add GA4, Google Ads and Meta tags inside GTM." /><F k="ga4Id" label="Google Analytics 4 ID" ph="G-XXXXXXXXXX" help="Only used when no GTM ID is set." /><F k="metaPixelId" label="Meta (Facebook) Pixel ID" ph="1234567890123456" /></div>
          <p className="hp" style={{ marginTop: 12, color: 'var(--mute)', fontSize: 12.5 }}>The store sends page_view, view_item, search, add_to_cart, remove_from_cart, add_to_wishlist, begin_checkout and purchase events (GA4 ecommerce format, in ₹).</p></div>
        <div className="panel" style={{ marginTop: 0 }}><h2>Abandoned carts & inventory</h2>
          <div style={grid}><F k="abandonAfterMin" label="Count a cart as abandoned after (minutes)" type="number" /><F k="lowStockAt" label="Low-stock warning at (units)" type="number" /></div>
          <div className="f" style={{ marginTop: 16 }}><label>Recovery message</label><textarea value={s.recoveryMessage} onChange={set('recoveryMessage')} /><span className="hp">Used for the WhatsApp / copy button. Placeholders: {'{name}'}, {'{items}'}, {'{link}'}.</span></div></div>
        <div><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button></div>
      </form>
      {msg && <div className={'atoast' + (msg.bad ? ' bad' : '')}>{msg.m}</div>}
    </>
  );
}
