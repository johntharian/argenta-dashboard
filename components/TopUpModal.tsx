'use client';

import { useState } from 'react';
import { wallets as api, formatMoney } from '@/lib/api';

interface Props {
  walletId: string;
  currentBalance: number; // wallet.balance in cents
  onClose: () => void;
  onSuccess: () => void;
}

export default function TopUpModal({ walletId, currentBalance, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed)) {
      setError('Enter an amount');
      return;
    }
    if (parsed <= 0) {
      setError('Amount must be greater than $0.00');
      return;
    }
    const cents = Math.round(parsed * 100);
    if (!cents) {
      setError('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const { checkout_url } = await api.topup(walletId, cents);
      window.location.href = checkout_url;
    } catch (err: any) {
      setError('Unable to top up wallet. Please try again later.');
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '24px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card modal-dialog" style={{ width: '100%', maxWidth: '360px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontWeight: 600, fontSize: '13px' }}>Top up wallet</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px 8px' }}>×</button>
        </div>

        {/* Current balance */}
        <div style={{ marginBottom: '16px', color: 'var(--text-2)', fontSize: '12px' }}>
          Available balance:{' '}
          <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
            {formatMoney(currentBalance)}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount input with $ prefix */}
          <div style={{ position: 'relative', marginBottom: error ? '8px' : '16px' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-3)', fontSize: '12px',
              pointerEvents: 'none',
            }}>$</span>
            <input
              className="input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ paddingLeft: '28px', width: '100%' }}
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Inline error */}
          {error && (
            <div style={{
              color: 'var(--red)', fontSize: '12px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '…' : 'Top up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
