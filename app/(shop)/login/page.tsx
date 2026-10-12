'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/Store';
import { api } from '@/lib/util';

export default function Login() {
  const { refreshUser, toast } = useStore(); const router = useRouter();
  const [signup, setSignup] = useState(false); const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [code, setCode] = useState(''); const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!sent) { const r = await api('/api/auth/otp', { method: 'POST', body: JSON.stringify({ phone }) }); setSent(true); toast('Code sent · ' + r.demoHint); }
      else { await api('/api/auth/verify', { method: 'POST', body: JSON.stringify({ phone, code, name: signup ? name : undefined }) }); await refreshUser(); toast('Logged in'); router.push('/profile'); }
    } catch (er: any) { toast(er.message); }
  };
  return (
    <div className="view"><div className="auth">
      <div className="logo" style={{ marginBottom: 6 }}><b>q</b>quickbaazar</div>
      <h1 className="disp" style={{ fontSize: 30, marginBottom: 4 }}>{signup ? 'Create account' : 'Welcome back'}</h1>
      <p style={{ color: 'var(--mute)', marginBottom: 18 }}>Log in for faster checkout and order tracking.</p>
      <div className="seg"><button className={signup ? '' : 'on'} onClick={() => setSignup(false)}>Log in</button><button className={signup ? 'on' : ''} onClick={() => setSignup(true)}>Sign up</button></div>
      <form onSubmit={submit}>
        {signup && <div className="fld"><label>Full name</label><input required value={name} onChange={e => setName(e.target.value)} placeholder="Harish" /></div>}
        <div className="fld"><label>Mobile number</label><input type="tel" inputMode="numeric" maxLength={10} required value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit number" /></div>
        {sent && <div className="fld"><label>Enter the 4-digit code</label><input maxLength={4} inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} placeholder="• • • •" style={{ letterSpacing: 12, textAlign: 'center', fontSize: 20 }} /></div>}
        <button className="btn block">{sent ? 'Verify & continue' : 'Send code'}</button>
      </form>
      <p style={{ textAlign: 'center', color: 'var(--mute)', margin: '14px 0' }}>or</p>
      <button className="sbtn" onClick={() => toast('Google sign-in — connect your provider')}>Continue with Google</button>
      <button className="sbtn" onClick={() => router.push('/bag')}>Continue as guest</button>
      <p style={{ fontSize: 12, color: 'var(--mute)', textAlign: 'center', marginTop: 10 }}>By continuing you agree to our Terms and Privacy Policy.</p>
    </div></div>
  );
}
