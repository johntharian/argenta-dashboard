'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  wallets as api, formatMoney, availableBalance, budgetPercent,
  type Wallet, type Policy, type Transaction, type Alert, type ApprovalRequest,
} from '@/lib/api';
import ClaimTokenBox from '@/components/ClaimTokenBox';
import TopUpModal from '@/components/TopUpModal';
import EditPolicyModal from '@/components/EditPolicyModal';

function StatusBadge({ status }: { status: Wallet['status'] }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

function TxRow({ tx }: { tx: Transaction }) {
  const statusColor = {
    settled: 'var(--green)', approved: 'var(--text-2)',
    declined: 'var(--red)', reversed: 'var(--amber)', pending: 'var(--text-3)',
  }[tx.status] ?? 'var(--text-2)';

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
      gap: '12px',
      alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{tx.merchant_name}</div>
        {tx.reason && <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>{tx.reason}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: statusColor }}>{formatMoney(tx.amount)}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '1px' }}>
          {new Date(tx.created_at).toLocaleDateString()}
        </div>
      </div>
      <div style={{ textAlign: 'right', minWidth: '60px' }}>
        <span style={{
          fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
          color: statusColor, padding: '2px 6px',
          background: tx.status === 'declined' ? 'var(--red-dim)' : tx.status === 'settled' ? 'var(--green-dim)' : 'var(--bg-2)',
          borderRadius: '2px',
        }}>{tx.status}</span>
      </div>
    </div>
  );
}

function ApprovalRow({ approval, walletId, onDecision }: { approval: ApprovalRequest; walletId: string; onDecision: () => void }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const minutesLeft = Math.max(0, Math.round((new Date(approval.expires_at).getTime() - Date.now()) / 60000));

  async function approve() {
    setLoading('approve');
    try { await api.approvePayment(walletId, approval.id); onDecision(); } finally { setLoading(null); }
  }
  async function reject() {
    setLoading('reject');
    try { await api.rejectPayment(walletId, approval.id); onDecision(); } finally { setLoading(null); }
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid var(--border)', gap: '12px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>
          {approval.merchant_name} — {formatMoney(approval.amount_cents)}
        </div>
        {approval.reason && (
          <div style={{ color: 'var(--text-3)', fontSize: '11px', marginBottom: '2px' }}>{approval.reason}</div>
        )}
        <div style={{ color: 'var(--text-3)', fontSize: '10px' }}>
          Expires in {minutesLeft}m · {new Date(approval.created_at).toLocaleTimeString()}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button className="btn btn-danger btn-sm" onClick={reject} disabled={loading !== null}>
          {loading === 'reject' ? '...' : 'Reject'}
        </button>
        <button className="btn btn-primary btn-sm" onClick={approve} disabled={loading !== null}>
          {loading === 'approve' ? '...' : 'Approve'}
        </button>
      </div>
    </div>
  );
}

function AlertRow({ alert, onResolve, walletId }: { alert: Alert; onResolve: () => void; walletId: string }) {
  const [loading, setLoading] = useState(false);
  const typeLabel = {
    threshold_exceeded: 'Threshold exceeded',
    approval_required: 'Approval required',
    frozen: 'Frozen',
    budget_exhausted: 'Budget exhausted',
    daily_limit_warning: 'Daily limit warning',
  }[alert.type] ?? alert.type;

  async function resolve() {
    setLoading(true);
    try { await api.resolveAlert(walletId, alert.id); onResolve(); } finally { setLoading(false); }
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid var(--border)', gap: '12px',
    }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--amber)', marginBottom: '2px' }}>
          {typeLabel}
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: '11px' }}>
          {new Date(alert.created_at).toLocaleString()}
        </div>
      </div>
      {!alert.resolved_at && (
        <button className="btn btn-ghost btn-sm" onClick={resolve} disabled={loading}>
          {loading ? '...' : 'Resolve'}
        </button>
      )}
      {alert.resolved_at && (
        <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>Resolved</span>
      )}
    </div>
  );
}

export default function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Safety guard: /wallets/settings is a static route that should never reach
  // this dynamic page, but redirect just in case.
  useEffect(() => {
    if (id === 'settings') { router.replace('/wallets/settings'); return; }
  }, [id, router]);

  const isReservedSegment = id === 'settings';

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [children, setChildren] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClaimToken, setNewClaimToken] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showEditPolicy, setShowEditPolicy] = useState(false);

  async function load() {
    try {
      const [walletData, txData, alertData, approvalData] = await Promise.all([
        api.get(id),
        api.transactions(id).catch(() => []),
        api.alerts(id).catch(() => []),
        api.approvals(id).catch(() => []),
      ]);
      setWallet(walletData.wallet);
      setPolicy(walletData.policy);
      setChildren(walletData.children ?? []);
      setTransactions(txData as Transaction[]);
      setAlerts(alertData as Alert[]);
      setApprovals(approvalData as ApprovalRequest[]);
    } catch {
      router.push('/wallets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (!isReservedSegment) load(); }, [id]);

  async function freeze() {
    if (!wallet) return;
    setActionLoading('freeze');
    try { await api.freeze(wallet.id); load(); } finally { setActionLoading(null); }
  }

  async function unfreeze() {
    if (!wallet) return;
    setActionLoading('unfreeze');
    try { await api.unfreeze(wallet.id); load(); } finally { setActionLoading(null); }
  }

  async function rotateKey() {
    if (!wallet) return;
    setActionLoading('rotate');
    try {
      const res = await api.rotateKey(wallet.id);
      setNewClaimToken(res.claim_token);
      load();
    } finally { setActionLoading(null); }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 40px', color: 'var(--text-3)' }}>Loading wallet...</div>
    );
  }
  if (!wallet) return null;

  const available = availableBalance(wallet);
  const used = budgetPercent(wallet);
  const fillClass = used >= 90 ? 'crit' : used >= 70 ? 'warn' : '';
  const unresolvedAlerts = alerts.filter(a => !a.resolved_at);

  return (
    <div style={{ padding: '32px 40px', maxWidth: '900px' }}>
      {/* Breadcrumb */}
      <div className="page-enter" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-3)', fontSize: '11px' }}>
        <Link href="/wallets" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Wallets</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-2)' }}>{wallet.name}</span>
      </div>

      {/* Header */}
      <div className="page-enter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="display" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {wallet.name}
            </span>
            <StatusBadge status={wallet.status} />
          </div>
          <div style={{ color: 'var(--text-3)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            {wallet.id}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => setShowTopUp(true)}>
            ↑ Top up
          </button>
          {wallet.status === 'active' ? (
            <button className="btn btn-danger" onClick={freeze} disabled={actionLoading === 'freeze'}>
              {actionLoading === 'freeze' ? '...' : '⏸ Freeze'}
            </button>
          ) : wallet.status === 'frozen' ? (
            <button className="btn btn-ghost" onClick={unfreeze} disabled={actionLoading === 'unfreeze'}>
              {actionLoading === 'unfreeze' ? '...' : '▶ Unfreeze'}
            </button>
          ) : null}
          <button className="btn btn-ghost" onClick={rotateKey} disabled={actionLoading === 'rotate'}>
            {actionLoading === 'rotate' ? '...' : '⟳ Rotate key'}
          </button>
        </div>
      </div>

      {/* New claim token */}
      {newClaimToken && (
        <ClaimTokenBox token={newClaimToken} onDismiss={() => setNewClaimToken(null)} />
      )}

      {showTopUp && (
        <TopUpModal
          walletId={wallet.id}
          currentBalance={wallet.balance}
          onClose={() => setShowTopUp(false)}
          onSuccess={() => { load(); setShowTopUp(false); }}
        />
      )}

      {/* Budget overview */}
      <div className="page-enter page-enter-delay-1" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px',
        background: 'var(--border)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '24px',
      }}>
        {[
          { label: 'Available', value: formatMoney(available), big: true, color: wallet.status === 'frozen' ? 'var(--red)' : undefined },
          { label: 'Spent', value: formatMoney(wallet.budget_used), big: false },
          { label: 'Budget', value: formatMoney(wallet.budget_limit), big: false },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--bg-1)', padding: '20px' }}>
            <div className="label" style={{ marginBottom: '6px' }}>{stat.label}</div>
            <div className="money" style={{ fontSize: stat.big ? '1.8rem' : '1.2rem', color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="page-enter page-enter-delay-1" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="label">Budget utilisation</span>
          <span style={{ fontSize: '11px', color: used >= 90 ? 'var(--red)' : 'var(--text-3)' }}>{used}%</span>
        </div>
        <div className="progress" style={{ height: '5px' }}>
          <div className={`progress-fill ${fillClass}`} style={{ width: `${used}%` }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Policy summary */}
        {policy && (
          <div className="card page-enter page-enter-delay-2" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 500, fontSize: '12px' }}>Spending policy</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditPolicy(true)}>Edit</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Max per transaction', value: formatMoney(policy.max_single_spend) },
                { label: 'Daily limit', value: policy.daily_limit ? formatMoney(policy.daily_limit) : 'None' },
                { label: 'Weekly limit', value: policy.weekly_limit ? formatMoney(policy.weekly_limit) : 'None' },
                { label: 'Alert above', value: policy.alert_threshold ? formatMoney(policy.alert_threshold) : 'Off' },
                { label: 'Require reason', value: policy.require_reason ? 'Yes' : 'No' },
                { label: 'Allowed MCC', value: policy.allowed_mcc_codes?.length ? policy.allowed_mcc_codes.join(', ') : 'All categories' },
                { label: 'Blocked MCC', value: policy.blocked_mcc_codes?.length ? policy.blocked_mcc_codes.join(', ') : 'None' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="label">{row.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showEditPolicy && policy && (
          <EditPolicyModal
            walletId={wallet.id}
            budgetLimit={wallet.budget_limit}
            policy={policy}
            onClose={() => setShowEditPolicy(false)}
            onSaved={() => { load(); setShowEditPolicy(false); }}
          />
        )}

        {/* Child wallets */}
        <div className="card page-enter page-enter-delay-2" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 500, marginBottom: '14px', fontSize: '12px' }}>
            Child wallets
            {children.length > 0 && (
              <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '6px' }}>({children.length})</span>
            )}
          </div>
          {children.length === 0 ? (
            <div style={{ color: 'var(--text-3)', fontSize: '12px' }}>
              No child wallets — use delegate to create one
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {children.map(child => (
                <Link key={child.id} href={`/wallets/${child.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', background: 'var(--bg-2)', borderRadius: 'var(--radius)',
                  }}>
                    <span style={{ fontSize: '12px' }}>{child.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{formatMoney(availableBalance(child))}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="card page-enter page-enter-delay-2" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontWeight: 500, fontSize: '12px' }}>
            Pending approvals
            {approvals.length > 0 && (
              <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '6px' }}>({approvals.length})</span>
            )}
          </span>
          {!wallet.require_approval && (
            <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>Approval gate off — agents spend autonomously</span>
          )}
        </div>
        {approvals.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: '12px', padding: '8px 0' }}>No pending approvals</div>
        ) : (
          approvals.map(a => (
            <ApprovalRow key={a.id} approval={a} walletId={wallet.id} onDecision={load} />
          ))
        )}
      </div>

      {/* Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div className="card page-enter page-enter-delay-2" style={{ padding: '20px', marginBottom: '16px', borderColor: 'var(--amber-dim)' }}>
          <div style={{ fontWeight: 500, marginBottom: '4px', fontSize: '12px', color: 'var(--amber)' }}>
            {unresolvedAlerts.length} unresolved alert{unresolvedAlerts.length !== 1 ? 's' : ''}
          </div>
          {unresolvedAlerts.map(a => (
            <AlertRow key={a.id} alert={a} walletId={wallet.id} onResolve={load} />
          ))}
        </div>
      )}

      {/* Transaction log */}
      <div className="card page-enter page-enter-delay-3" style={{ padding: '20px' }}>
        <div style={{ fontWeight: 500, marginBottom: '14px', fontSize: '12px' }}>
          Transaction log
          {transactions.length > 0 && (
            <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '6px' }}>({transactions.length})</span>
          )}
        </div>
        {transactions.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: '12px', padding: '12px 0' }}>No transactions yet</div>
        ) : (
          transactions.map(tx => <TxRow key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  );
}
