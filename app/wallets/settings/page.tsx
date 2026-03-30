'use client';

import { useState, useEffect } from 'react';
import { users as usersApi, UserProfile, billing, type BillingStatus } from '@/lib/api';

export default function SettingsPage() {

  // ── Profile form state ─────────────────────────────────────────────────────
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrCountry, setAddrCountry] = useState('US');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    usersApi.me().then(p => {
      setProfile(p);
      setFirstName(p.first_name);
      setLastName(p.last_name);
      setPhone(p.phone);
      setAddrLine1(p.address.line1);
      setAddrCity(p.address.city);
      setAddrState(p.address.state);
      setAddrPostal(p.address.postal_code);
      setAddrCountry(p.address.country || 'US');
      if (p.dob.day) setDobDay(String(p.dob.day));
      if (p.dob.month) setDobMonth(String(p.dob.month));
      if (p.dob.year) setDobYear(String(p.dob.year));
    }).catch(() => {});
    billing.status().then(setBillingStatus).catch(() => {});
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSaving(true);
    try {
      await usersApi.updateMe({
        first_name: firstName,
        last_name: lastName,
        phone,
        address: { line1: addrLine1, city: addrCity, state: addrState, postal_code: addrPostal, country: addrCountry },
        dob: {
          day: dobDay ? parseInt(dobDay) : null,
          month: dobMonth ? parseInt(dobMonth) : null,
          year: dobYear ? parseInt(dobYear) : null,
        },
      });
      setProfileToast('Profile saved');
      setTimeout(() => setProfileToast(''), 3000);
    } catch (err: any) {
      setProfileError('Unable to save profile. Please try again later.');
    } finally {
      setProfileSaving(false);
    }
  }

  return (
    <div className="page-enter" style={{ padding: '40px', maxWidth: '720px' }}>

      <div style={{ marginBottom: '36px' }}>
        <p className="label" style={{ marginBottom: '6px' }}>Settings</p>
        <h1 className="display" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Configuration
        </h1>
      </div>

      {/* Billing */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '4px' }}>
          Plan
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: '11px', marginBottom: '16px' }}>
          Your current subscription plan.
        </p>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Current plan:</span>
            {billingStatus?.is_pro ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 10px',
                background: 'var(--green-dim)',
                border: '1px solid var(--green)',
                borderRadius: '20px',
                fontSize: '11px', fontWeight: 600, color: 'var(--green)',
              }}>Pro</span>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                fontSize: '11px', fontWeight: 600, color: 'var(--text-3)',
              }}>Free</span>
            )}
          </div>

          {billingStatus?.is_pro ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--green)' }}>● Active</span>
              </div>
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  try {
                    const res = await billing.portal();
                    window.location.href = res.portal_url;
                  } catch {/* ignore */}
                }}
              >
                Manage subscription
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.6, marginBottom: '16px' }}>
                Free plan is limited to 1 wallet. Upgrade to Pro for unlimited wallets, priority support, and early access to new features.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      const res = await billing.upgrade();
                      window.location.href = res.checkout_url;
                    } catch {/* ignore */}
                  }}
                >
                  Upgrade to Pro — $9/mo
                </button>
                <span style={{
                  fontSize: '11px', color: '#ca8a04',
                  padding: '3px 8px',
                  background: 'rgba(234,179,8,0.1)',
                  border: '1px solid rgba(234,179,8,0.3)',
                  borderRadius: '12px',
                }}>
                  🎉 Intro offer: $5/mo with code EARLYBIRD
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <hr className="divider" style={{ marginBottom: '40px' }} />

      {/* Profile */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '4px' }}>
          Profile
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: '11px', marginBottom: '16px' }}>
          Required for Stripe Issuing compliance. Used as the cardholder name on all your virtual cards.
        </p>
        <form className="card" style={{ padding: '20px' }} onSubmit={saveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>First name *</label>
              <input className="input" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Last name *</label>
              <input className="input" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Phone</label>
            <input className="input" placeholder="+1 312 555 0100" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Address line 1 *</label>
            <input className="input" placeholder="912 Pine Rd" value={addrLine1} onChange={e => setAddrLine1(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>City *</label>
              <input className="input" placeholder="Chicago" value={addrCity} onChange={e => setAddrCity(e.target.value)} required />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>State *</label>
              <input className="input" placeholder="IL" value={addrState} onChange={e => setAddrState(e.target.value)} required />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Postal code *</label>
              <input className="input" placeholder="60625" value={addrPostal} onChange={e => setAddrPostal(e.target.value)} required />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Country</label>
            <input className="input" placeholder="US" value={addrCountry} onChange={e => setAddrCountry(e.target.value)} />
          </div>

          <div>
            <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Date of birth (optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 100px', gap: '8px' }}>
              <input className="input" type="number" min="1" max="31" placeholder="DD" value={dobDay} onChange={e => setDobDay(e.target.value)} />
              <input className="input" type="number" min="1" max="12" placeholder="MM" value={dobMonth} onChange={e => setDobMonth(e.target.value)} />
              <input className="input" type="number" min="1900" max="2099" placeholder="YYYY" value={dobYear} onChange={e => setDobYear(e.target.value)} />
            </div>
          </div>

          {profileError && (
            <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: '12px' }}>
              {profileError}
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={profileSaving}>
              {profileSaving ? 'Saving…' : 'Save profile'}
            </button>
            {profileToast && (
              <span style={{ color: 'var(--green)', fontSize: '12px' }}>{profileToast}</span>
            )}
          </div>
        </form>
      </section>

    </div>
  );
}
