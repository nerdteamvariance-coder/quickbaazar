'use client';
import { useState } from 'react';
import { PageHead } from '@/components/Empty';
import { useStore } from '@/components/Store';
import { api } from '@/lib/util';

export default function Contact() {
  const { toast } = useStore();
  const [f, setF] = useState({ name: '', email: '', orderId: '', topic: 'Order status', message: '' });
  const on = (k: string) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="view"><PageHead title="Talk to us" sub="Average reply time: under 2 hours, 9am–11pm every day." crumb="Contact" />
      <div className="pg c2">
        <form className="pn" onSubmit={async e => { e.preventDefault(); try { const r = await api('/api/contact', { method: 'POST', body: JSON.stringify(f) }); toast('Message sent · ticket ' + r.ticketId); setF({ ...f, message: '' }); } catch (er: any) { toast(er.message); } }}>
          <h3>Send a message</h3>
          <div className="two"><div className="fld"><label>Your name</label><input required value={f.name} onChange={on('name')} placeholder="Harish" /></div><div className="fld"><label>Email</label><input required type="email" value={f.email} onChange={on('email')} placeholder="you@email.com" /></div></div>
          <div className="fld"><label>Order ID (optional)</label><input value={f.orderId} onChange={on('orderId')} placeholder="QB-10482" /></div>
          <div className="fld"><label>Topic</label><select value={f.topic} onChange={on('topic')}><option>Order status</option><option>Return or exchange</option><option>Payment issue</option><option>Something else</option></select></div>
          <div className="fld"><label>Message</label><textarea rows={5} required value={f.message} onChange={on('message')} placeholder="How can we help?" /></div>
          <button className="btn block">Send message</button>
        </form>
        <div className="pg" style={{ margin: 0 }}><div className="pn"><h3>Call us</h3><p>1800-000-QUICK (toll free)</p></div><div className="pn"><h3>Email</h3><p>help@quickbaazar.example</p></div><div className="pn"><h3>Head office</h3><p>QuickBaazar Retail Pvt Ltd, Sector 62, Noida 201309</p></div></div>
      </div>
    </div>
  );
}
