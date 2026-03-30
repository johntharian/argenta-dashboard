'use client';

import { useState } from 'react';
import { billing } from '@/lib/api';

interface Props {
  onClose: () => void;
}

const PRO_BENEFITS = [
  'Unlimited wallets',
  'Priority support',
  'Early access to new features',
];

export default function UpgradeModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpgrade() {
    setError('');
    setLoading(true);
    try {
      const res = await billing.upgrade();
      window.location.href = res.checkout_url;
    } catch (err: any) {
      setError('Unable to start checkout. Please try again later.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(8,11,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card modal-dialog" style={{
        width: '100%', maxWidth: '420px',
        padding: '32px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h2 className="display" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Upgrade to Pro
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '18px', lineHeight: 1, padding: '2px 4px' }}>×</button>
        </div>

        {/* Price */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em' }}>$9</span>
          <span style={{ color: 'var(--text-3)', fontSize: '14px', marginLeft: '4px' }}>/month</span>
        </div>

        {/* Intro offer badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 10px',
          background: 'rgba(234,179,8,0.1)',
          border: '1px solid rgba(234,179,8,0.4)',
          borderRadius: '20px',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '12px', color: '#ca8a04', fontWeight: 500 }}>
            🎉 Intro offer: $5/mo with code EARLYBIRD
          </span>
        </div>

        {/* Benefits list */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PRO_BENEFITS.map(benefit => (
            <li key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--green)', fontSize: '14px', flexShrink: 0 }}>✓</span>
              <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Error */}
        {error && (
          <div style={{
            padding: '8px 12px',
            background: 'var(--red-dim)',
            border: '1px solid var(--red)',
            borderRadius: 'var(--radius)',
            color: 'var(--red)',
            fontSize: '12px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={handleUpgrade}
            disabled={loading}
            style={{ justifyContent: 'center', width: '100%' }}
          >
            {loading ? 'Redirecting...' : 'Upgrade — $9/mo'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            style={{ justifyContent: 'center', width: '100%' }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
