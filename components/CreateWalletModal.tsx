'use client';

import { useState, useEffect } from 'react';
import { wallets as api, users as usersApi } from '@/lib/api';
import ClaimTokenBox from './ClaimTokenBox';
import UpgradeModal from './UpgradeModal';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateWalletModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [maxSingle, setMaxSingle] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [requireReason, setRequireReason] = useState(true);
  const [blockedMCCs, setBlockedMCCs] = useState<string[]>([]);
  const [blockedMccInput, setBlockedMccInput] = useState('');
  const [allowedMCCs, setAllowedMCCs] = useState<string[]>([]);
  const [allowedMccInput, setAllowedMccInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    usersApi.me()
      .then(p => setProfileComplete(p.profile_complete))
      .catch(() => setProfileComplete(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.create({
        name,
        budget_limit: Math.round(parseFloat(budget) * 100),
        policy: {
          max_single_spend: Math.round(parseFloat(maxSingle || budget) * 100),
          daily_limit: dailyLimit ? Math.round(parseFloat(dailyLimit) * 100) : null,
          weekly_limit: null,
          allowed_mcc_codes: allowedMCCs,
          blocked_mcc_codes: blockedMCCs,
          blocked_merchants: [],
          require_reason: requireReason,
          alert_threshold: alertThreshold ? Math.round(parseFloat(alertThreshold) * 100) : 0,
          human_approval_above: null,
        },
      });
      setClaimToken(res.claim_token);
    } catch (err: any) {
      if ((err as any).code === 'upgrade_required') {
        setShowUpgrade(true);
      } else {
        setError('Unable to create wallet. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <div className="modal-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(8,11,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card modal-dialog" style={{
        width: '100%', maxWidth: '480px',
        padding: '28px',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span className="display" style={{ fontSize: '16px', fontWeight: 700 }}>Create wallet</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '18px' }}>×</button>
        </div>

        {profileComplete === false ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{
              padding: '12px 16px',
              background: 'var(--yellow-dim, rgba(234,179,8,0.08))',
              border: '1px solid var(--yellow, #ca8a04)',
              borderRadius: 'var(--radius)',
              marginBottom: '20px',
            }}>
              <p style={{ color: 'var(--yellow, #ca8a04)', fontSize: '12px', lineHeight: 1.6 }}>
                Complete your profile in Settings before creating a wallet.
              </p>
            </div>
            <a
              href="/wallets/settings"
              className="btn btn-primary"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Go to Settings
            </a>
          </div>
        ) : claimToken ? (
          <>
            <ClaimTokenBox token={claimToken} />
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onCreated}>
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Wallet name</label>
              <input className="input" placeholder="e.g. Shopping assistant" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Total budget ($)</label>
                <input className="input" type="number" min="1" step="0.01" placeholder="100.00"
                  value={budget} onChange={e => setBudget(e.target.value)} required />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Max per transaction ($)</label>
                <input className="input" type="number" min="0.01" step="0.01" placeholder="30.00"
                  value={maxSingle} onChange={e => setMaxSingle(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Daily limit ($)</label>
                <input className="input" type="number" min="0" step="0.01" placeholder="Optional"
                  value={dailyLimit} onChange={e => setDailyLimit(e.target.value)} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Alert me above ($)</label>
                <input className="input" type="number" min="0" step="0.01" placeholder="20.00"
                  value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
              <input
                type="checkbox"
                id="require-reason"
                checked={requireReason}
                onChange={e => setRequireReason(e.target.checked)}
                style={{ accentColor: 'var(--green)', width: 14, height: 14 }}
              />
              <label htmlFor="require-reason" style={{ fontSize: '12px', cursor: 'pointer' }}>
                Require agent to provide reason for each spend
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Allowed MCC codes */}
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                  Allowed categories
                  <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '6px' }}>MCC — Enter to add</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: allowedMCCs.length ? '8px' : '0' }}>
                  {allowedMCCs.map(code => (
                    <span key={code} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 6px', background: 'var(--green-dim)',
                      border: '1px solid var(--green)', borderRadius: '2px',
                      fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)',
                    }}>
                      {code}
                      <button type="button" onClick={() => setAllowedMCCs(prev => prev.filter(c => c !== code))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. 5411"
                  value={allowedMccInput}
                  maxLength={4}
                  onChange={e => setAllowedMccInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ',') && allowedMccInput.length === 4) {
                      e.preventDefault();
                      if (!allowedMCCs.includes(allowedMccInput)) setAllowedMCCs(prev => [...prev, allowedMccInput]);
                      setAllowedMccInput('');
                    }
                    if (e.key === 'Backspace' && allowedMccInput === '' && allowedMCCs.length > 0) {
                      setAllowedMCCs(prev => prev.slice(0, -1));
                    }
                  }}
                />
              </div>

              {/* Blocked MCC codes */}
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                  Blocked categories
                  <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '6px' }}>MCC — Enter to add</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: blockedMCCs.length ? '8px' : '0' }}>
                  {blockedMCCs.map(code => (
                    <span key={code} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 6px', background: 'var(--red-dim)',
                      border: '1px solid var(--red)', borderRadius: '2px',
                      fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--red)',
                    }}>
                      {code}
                      <button type="button" onClick={() => setBlockedMCCs(prev => prev.filter(c => c !== code))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. 7995"
                  value={blockedMccInput}
                  maxLength={4}
                  onChange={e => setBlockedMccInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ',') && blockedMccInput.length === 4) {
                      e.preventDefault();
                      if (!blockedMCCs.includes(blockedMccInput)) setBlockedMCCs(prev => [...prev, blockedMccInput]);
                      setBlockedMccInput('');
                    }
                    if (e.key === 'Backspace' && blockedMccInput === '' && blockedMCCs.length > 0) {
                      setBlockedMCCs(prev => prev.slice(0, -1));
                    }
                  }}
                />
              </div>
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
                {loading ? 'Creating...' : 'Create wallet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
