const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(
  path: string,
  opts: RequestInit & { auth?: 'jwt' | 'none' } = {}
): Promise<T> {
  const { auth = 'jwt', ...rest } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string> | undefined),
  };
  if (auth === 'jwt') {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/v1${path}`, { ...rest, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user_id?: string;
  email?: string;
}

export const auth = {
  signup: (email: string, password: string) =>
    request<TokenResponse>('/auth/signup', {
      method: 'POST', auth: 'none',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<TokenResponse>('/auth/login', {
      method: 'POST', auth: 'none',
      body: JSON.stringify({ email, password }),
    }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  dob: { day: number | null; month: number | null; year: number | null };
  profile_complete: boolean;
}

export const users = {
  me: () => request<UserProfile>('/users/me'),
  updateMe: (body: Partial<{
    first_name: string; last_name: string; phone: string;
    address: { line1: string; city: string; state: string; postal_code: string; country: string };
    dob: { day: number | null; month: number | null; year: number | null };
  }>) => request<UserProfile>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
};

// ── Wallets ───────────────────────────────────────────────────────────────────

export interface Policy {
  id: string;
  wallet_id: string;
  max_single_spend: number;
  daily_limit: number | null;
  weekly_limit: number | null;
  allowed_mcc_codes: string[];
  blocked_merchants: string[];
  require_reason: boolean;
  alert_threshold: number;
  human_approval_above: number | null;
}

export interface Wallet {
  id: string;
  owner_id: string;
  parent_wallet_id: string | null;
  name: string;
  status: 'active' | 'frozen' | 'exhausted' | 'expired';
  budget_limit: number;
  budget_used: number;
  budget_reserved: number;
  balance: number;
  stripe_card_id: string;
  claim_token: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  merchant_name: string;
  merchant_mcc: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined' | 'settled' | 'reversed';
  created_at: string;
  settled_at: string | null;
}

export interface Alert {
  id: string;
  wallet_id: string;
  type: 'threshold_exceeded' | 'approval_required' | 'frozen' | 'budget_exhausted' | 'daily_limit_warning';
  transaction_id: string | null;
  payload: Record<string, unknown>;
  notified_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export const wallets = {
  list: () => request<{ wallets: Wallet[] }>('/wallets').then(r => r.wallets ?? []),

  get: (id: string) => request<{ wallet: Wallet; policy: Policy; children: Wallet[] }>(`/wallets/${id}`),

  create: (body: {
    name: string; budget_limit: number; expires_at?: string;
    policy: Partial<Policy>;
  }) => request<{ wallet: Wallet; policy: Policy; claim_token: string }>('/wallets', {
    method: 'POST', body: JSON.stringify(body),
  }),

  update: (id: string, body: { name?: string; budget_limit?: number }) =>
    request<Wallet>(`/wallets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  freeze: (id: string) =>
    request<{ status: string }>(`/wallets/${id}/freeze`, { method: 'POST' }),

  unfreeze: (id: string) =>
    request<{ status: string }>(`/wallets/${id}/unfreeze`, { method: 'POST' }),

  topup: (id: string, amount_cents: number) =>
    request<Wallet>(`/wallets/${id}/topup`, {
      method: 'POST', body: JSON.stringify({ amount_cents }),
    }),

  rotateKey: (id: string) =>
    request<{ claim_token: string; expires_at: string }>(`/wallets/${id}/rotate-key`, { method: 'POST' }),

  delegate: (id: string, body: { name: string; budget_limit: number }) =>
    request<{ wallet: Wallet; policy: Policy; claim_token: string }>(`/wallets/${id}/delegate`, {
      method: 'POST', body: JSON.stringify(body),
    }),

  transactions: (id: string) =>
    request<{ transactions: Transaction[] }>(`/wallets/${id}/transactions`).then(r => r.transactions ?? []),

  alerts: (id: string) =>
    request<{ alerts: Alert[] }>(`/wallets/${id}/alerts`).then(r => r.alerts ?? []),

  resolveAlert: (walletId: string, alertId: string) =>
    request<{ status: string }>(`/wallets/${walletId}/alerts/${alertId}/resolve`, { method: 'POST' }),
};

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function availableBalance(w: Wallet): number {
  return w.balance;
}

export function budgetPercent(w: Wallet): number {
  if (w.budget_limit === 0) return 0;
  return Math.min(100, Math.round((w.budget_used / w.budget_limit) * 100));
}
