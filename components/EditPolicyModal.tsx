'use client';

import { useState } from 'react';
import { wallets as api, type Policy } from '@/lib/api';

interface Props {
  walletId: string;
  budgetLimit: number;
  policy: Policy;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditPolicyModal({ walletId, budgetLimit, policy, onClose, onSaved }: Props) {
  const [maxSingle, setMaxSingle] = useState(String((policy.max_single_spend / 100).toFixed(2)));
  const [dailyLimit, setDailyLimit] = useState(policy.daily_limit ? String((policy.daily_limit / 100).toFixed(2)) : '');
  const [weeklyLimit, setWeeklyLimit] = useState(policy.weekly_limit ? String((policy.weekly_limit / 100).toFixed(2)) : '');
  const [alertThreshold, setAlertThreshold] = useState(policy.alert_threshold ? String((policy.alert_threshold / 100).toFixed(2)) : '');
  const [requireReason, setRequireReason] = useState(policy.require_reason);
  const [allowedMCCs, setAllowedMCCs] = useState<string[]>(policy.allowed_mcc_codes ?? []);
  const [allowedInput, setAllowedInput] = useState('');
  const [blockedMCCs, setBlockedMCCs] = useState<string[]>(policy.blocked_mcc_codes ?? []);
  const [blockedInput, setBlockedInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.updatePolicy(walletId, {
        max_single_spend: Math.round(parseFloat(maxSingle) * 100),
        daily_limit: dailyLimit ? Math.round(parseFloat(dailyLimit) * 100) : null,
        weekly_limit: weeklyLimit ? Math.round(parseFloat(weeklyLimit) * 100) : null,
        alert_threshold: alertThreshold ? Math.round(parseFloat(alertThreshold) * 100) : 0,
        require_reason: requireReason,
        allowed_mcc_codes: allowedMCCs,
        blocked_mcc_codes: blockedMCCs,
      });
      onSaved();
    } catch (err: any) {
      setError('Unable to update policy. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  function mccInput(
    label: string,
    color: 'green' | 'red',
    list: string[],
    setList: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void,
  ) {
    return (
      <div>
        <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
          {label}
          <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '6px' }}>MCC — Enter to add</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: list.length ? '8px' : '0' }}>
          {list.map(code => (
            <span key={code} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 6px',
              background: `var(--${color}-dim)`, border: `1px solid var(--${color})`,
              borderRadius: '2px', fontSize: '11px', fontFamily: 'var(--font-mono)',
              color: `var(--${color})`,
            }}>
              {code}
              <button type="button" onClick={() => setList(list.filter(c => c !== code))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: `var(--${color})`, padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
        <input
          className="input"
          type="text"
          placeholder="e.g. 5411"
          value={input}
          maxLength={4}
          onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && input.length === 4) {
              e.preventDefault();
              if (!list.includes(input)) setList([...list, input]);
              setInput('');
            }
            if (e.key === 'Backspace' && input === '' && list.length > 0) {
              setList(list.slice(0, -1));
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(8,11,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card modal-dialog" style={{
        width: '100%', maxWidth: '480px', padding: '28px',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span className="display" style={{ fontSize: '16px', fontWeight: 700 }}>Edit policy</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '18px' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Max per transaction ($)</label>
              <input className="input" type="number" min="0.01" step="0.01" required
                value={maxSingle} onChange={e => setMaxSingle(e.target.value)} />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Alert me above ($)</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="Off"
                value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Daily limit ($)</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="None"
                value={dailyLimit} onChange={e => setDailyLimit(e.target.value)} />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Weekly limit ($)</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="None"
                value={weeklyLimit} onChange={e => setWeeklyLimit(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
            <input
              type="checkbox"
              id="edit-require-reason"
              checked={requireReason}
              onChange={e => setRequireReason(e.target.checked)}
              style={{ accentColor: 'var(--green)', width: 14, height: 14 }}
            />
            <label htmlFor="edit-require-reason" style={{ fontSize: '12px', cursor: 'pointer' }}>
              Require agent to provide reason for each spend
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {mccInput('Allowed categories', 'green', allowedMCCs, setAllowedMCCs, allowedInput, setAllowedInput)}
            {mccInput('Blocked categories', 'red', blockedMCCs, setBlockedMCCs, blockedInput, setBlockedInput)}
          </div>

          {error && (
            <div style={{ padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: '12px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
              {loading ? 'Saving...' : 'Save policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
