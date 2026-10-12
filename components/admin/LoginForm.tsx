'use client';
import { useState } from 'react';

export default function LoginForm({ demo }: { demo: boolean }) {
  const [email, setEmail] = useState(demo ? 'admin@quickbaazar.com' : ''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ email: email.trim(), password }) });
      const j = await r.json().catch(() => null);
      if (r.ok) { location.assign('/admin/dashboard'); return; }
      setErr(j?.error ? j.error : `Server error (${r.status}). Check the terminal running the app for details.`);
    } catch { setErr('Can’t reach the server. Is `npm run dev` still running?'); }
    setBusy(false);
  };
  return (
    <div className="adm"><div className="login">
      <form onSubmit={submit}>
        <div className="brand" style={{ width: 'auto', padding: 0 }}><b>q</b><div>QuickBaazar<small>Admin panel</small></div></div>
        <h1>Welcome back</h1>
        <div className="f"><label>Email</label><input type="text" autoComplete="username" required autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@quickbaazar.com" /></div>
        <div className="f"><label>Password</label>
          <div style={{ position: 'relative' }}><input type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 64 }} />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 10, top: 10, fontWeight: 700, fontSize: 12.5, color: 'var(--amber)' }}>{show ? 'Hide' : 'Show'}</button></div></div>
        {err && <div className="f err"><span className="em" role="alert">{err}</span></div>}
        <button className="btn" style={{ height: 46 }} disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        {demo && <div className="hint">Demo login — email <b>admin@quickbaazar.com</b> · password <b>admin123</b>. Set ADMIN_USER and ADMIN_PASSWORD in .env.local before going live.</div>}
      </form>
    </div></div>
  );
}
