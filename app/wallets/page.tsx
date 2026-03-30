'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { wallets as api, formatMoney, availableBalance, budgetPercent, type Wallet } from '@/lib/api';
import CreateWalletModal from '@/components/CreateWalletModal';

function WalletCard({ wallet }: { wallet: Wallet }) {
  const available = availableBalance(wallet);
  const used = budgetPercent(wallet);
  const fillClass = used >= 90 ? 'crit' : used >= 70 ? 'warn' : '';

  return (
    <Link href={`/wallets/${wallet.id}`} style={{ textDecoration: 'none' }}>
      <div className="card page-enter wallet-card" style={{
        padding: '20px',
        cursor: 'pointer',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{wallet.name}</div>
            <div className="label">
              {wallet.expires_at ? `expires ${new Date(wallet.expires_at).toLocaleDateString()}` : 'no expiry'}
            </div>
          </div>
          <span className={`badge badge-${wallet.status}`}>{wallet.status}</span>
        </div>

        {/* Balance */}
        <div style={{ marginBottom: '12px' }}>
          <div className="label" style={{ marginBottom: '4px' }}>Available</div>
          <div className="money" style={{ fontSize: '1.6rem', color: wallet.status === 'frozen' ? 'var(--red)' : 'var(--text)' }}>
            {formatMoney(available)}
          </div>
          <div style={{ color: 'var(--text-3)', fontSize: '11px', marginTop: '2px' }}>
            of {formatMoney(wallet.budget_limit)}
          </div>
        </div>

        {/* Progress */}
        <div className="progress" style={{ marginBottom: '12px' }}>
          <div className={`progress-fill ${fillClass}`} style={{ width: `${used}%` }} />
        </div>

        {/* Footer stats */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div>
            <div className="label">Spent</div>
            <div style={{ fontSize: '12px', marginTop: '2px' }}>{formatMoney(wallet.budget_used)}</div>
          </div>
          {wallet.budget_reserved > 0 && (
            <div>
              <div className="label">Reserved</div>
              <div style={{ fontSize: '12px', marginTop: '2px', color: 'var(--amber)' }}>
                {formatMoney(wallet.budget_reserved)}
              </div>
            </div>
          )}
          {wallet.parent_wallet_id && (
            <div style={{ marginLeft: 'auto' }}>
              <div className="label">Child wallet</div>
              <div style={{ fontSize: '11px', marginTop: '2px', color: 'var(--text-3)' }}>delegated</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function WalletsPage() {
  const [walletList, setWalletList] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    try {
      const list = await api.list();
      setWalletList(list ?? []);
    } catch {
      setWalletList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalBudget = walletList.reduce((s, w) => s + w.budget_limit, 0);
  const totalUsed   = walletList.reduce((s, w) => s + w.budget_used, 0);
  const active      = walletList.filter(w => w.status === 'active').length;

  return (
    <div style={{ padding: '32px 40px', maxWidth: '960px' }}>
      {/* Header */}
      <div className="page-enter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <div className="display" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Wallets
          </div>
          <div style={{ color: 'var(--text-2)', fontSize: '12px' }}>
            {walletList.length} wallet{walletList.length !== 1 ? 's' : ''} · {active} active
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New wallet
        </button>
      </div>

      {/* Summary strip */}
      {walletList.length > 0 && (
        <div className="page-enter page-enter-delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
          background: 'var(--border)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '28px',
        }}>
          {[
            { label: 'Total budget', value: formatMoney(totalBudget) },
            { label: 'Total spent', value: formatMoney(totalUsed) },
            { label: 'Remaining', value: formatMoney(totalBudget - totalUsed) },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-1)', padding: '16px 20px' }}>
              <div className="label" style={{ marginBottom: '4px' }}>{stat.label}</div>
              <div className="money" style={{ fontSize: '1.2rem' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Wallet grid */}
      {loading ? (
        <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: '60px 0' }}>
          Loading wallets...
        </div>
      ) : walletList.length === 0 ? (
        <div className="card page-enter page-enter-delay-2" style={{
          padding: '60px 40px',
          textAlign: 'center',
          borderStyle: 'dashed',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '12px', opacity: 0.3 }}>◈</div>
          <div style={{ color: 'var(--text-2)', marginBottom: '8px' }}>No wallets yet</div>
          <div style={{ color: 'var(--text-3)', fontSize: '12px', marginBottom: '20px' }}>
            Create a wallet to give your AI agent a scoped budget
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            Create first wallet
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {walletList.map(w => <WalletCard key={w.id} wallet={w} />)}
        </div>
      )}

      {showCreate && (
        <CreateWalletModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}
