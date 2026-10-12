'use client';
import { useState } from 'react';
import { api } from '@/lib/util';
import { useStore } from './Store';

export default function Newsletter() {
  const [email, setEmail] = useState(''); const { toast } = useStore();
  return (
    <form onSubmit={async e => { e.preventDefault(); try { await api('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) }); toast('Subscribed — check your inbox'); setEmail(''); } catch (er: any) { toast(er.message); } }}>
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" aria-label="Email" /><button>Subscribe</button>
    </form>
  );
}
