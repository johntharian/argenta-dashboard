'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.betaCheck(email);
      setStep('password');
    } catch (err: any) {
      if (err?.code === 'beta_waitlist') {
        await supabase.from('waitlist').upsert({ email }, { onConflict: 'email' });
        setWaitlisted(true);
      } else {
        setError(err.message || 'Unable to verify email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.signup(email, password);
      document.cookie = `access_token=${res.access_token}; path=/; max-age=900; SameSite=Strict; Secure`;
      document.cookie = `refresh_token=${res.refresh_token}; path=/; max-age=604800; SameSite=Strict; Secure`;
      router.push('/wallets');
    } catch (err: any) {
      setError(err.message || 'Unable to create account. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        opacity: 0.4,
      }} />

      <div className="page-enter" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '380px' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: 28, height: 28, background: 'var(--green)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4v6l-6 3L1 10V4L7 1z" fill="#000"/>
              </svg>
            </div>
            <span className="display" style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>AgentPay</span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '12px' }}>
            Create your control center account
          </p>
        </div>

        {waitlisted ? (
          <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                width: 40, height: 40,
                background: 'var(--green-dim, rgba(0,200,100,0.12))',
                border: '1px solid var(--green)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="var(--green)" strokeWidth="1.5"/>
                  <circle cx="8" cy="8" r="3" fill="var(--green)"/>
                </svg>
              </div>
              <p className="display" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
                You're on the list
              </p>
              <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: '1.6' }}>
                We've noted your interest. We'll email you at{' '}
                <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{email}</span>{' '}
                as soon as a spot opens up.
              </p>
            </div>
            <Link href="/login" style={{
              display: 'block',
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-2)',
              fontSize: '12px',
              textDecoration: 'none',
              textAlign: 'center',
            }}>
              Back to login
            </Link>
          </div>
        ) : step === 'email' ? (
          <div className="card" style={{ padding: '28px' }}>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>

              {error && (
                <div style={{ padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: '12px' }}>
                  {error}
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ padding: '28px' }}>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Email</label>
                <p style={{ fontSize: '13px', color: 'var(--text-1)', padding: '8px 10px', background: 'var(--bg-2, var(--bg))', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  {email}
                </p>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Password</label>
                <input className="input" type="password" placeholder="min 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoFocus />
              </div>

              {error && (
                <div style={{ padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: '12px' }}>
                  {error}
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <button type="button" onClick={() => { setStep('email'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '12px', cursor: 'pointer', padding: 0, textAlign: 'center' }}>
                ← Back
              </button>
            </form>
          </div>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '12px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--green)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
