const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getRefreshToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)refresh_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setTokenCookies(accessToken: string, refreshToken: string) {
  document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Strict; Secure`;
  document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Strict; Secure`;
}

// Shared in-flight refresh promise to avoid concurrent refresh storms
let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data: TokenResponse = await res.json();
  setTokenCookies(data.access_token, data.refresh_token);
}

async function request<T>(
  path: string,
  opts: RequestInit & { auth?: 'jwt' | 'none'; _retried?: boolean } = {}
): Promise<T> {
  const { auth = 'jwt', _retried = false, ...rest } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string> | undefined),
  };
  if (auth === 'jwt') {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/v1${path}`, { ...rest, headers });

  // Auto-refresh on 401 — retry once
  if (res.status === 401 && auth === 'jwt' && !_retried) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => { refreshPromise = null; });
      }
      await refreshPromise;
      return request<T>(path, { ...opts, _retried: true });
    } catch {
      // Refresh failed — redirect to login
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText, code: '' }));
    const e = new Error(err.error ?? 'Request failed') as Error & { code?: string };
    e.code = err.code;
    throw e;
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
  betaCheck: (email: string) =>
    request<{ allowed: boolean }>('/auth/beta-check', {
      method: 'POST', auth: 'none',
      body: JSON.stringify({ email }),
    }),
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
  refresh: (refreshToken: string) =>
    request<TokenResponse>('/auth/refresh', {
      method: 'POST', auth: 'none',
      body: JSON.stringify({ refresh_token: refreshToken }),
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
  blocked_mcc_codes: string[];
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

export interface BillingStatus {
  is_pro: boolean;
  subscription_id: string;
  subscription_status: 'active' | 'inactive';
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
    request<{ checkout_url: string }>(`/wallets/${id}/topup`, {
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

  updatePolicy: (id: string, body: Partial<Omit<Policy, 'id' | 'wallet_id' | 'created_at' | 'updated_at'>>) =>
    request<Policy>(`/wallets/${id}/policy`, { method: 'PATCH', body: JSON.stringify(body) }),

  alerts: (id: string) =>
    request<{ alerts: Alert[] }>(`/wallets/${id}/alerts`).then(r => r.alerts ?? []),

  resolveAlert: (walletId: string, alertId: string) =>
    request<{ status: string }>(`/wallets/${walletId}/alerts/${alertId}/resolve`, { method: 'POST' }),
};

export const billing = {
  status: () => request<BillingStatus>('/billing/status'),
  upgrade: () => request<{ checkout_url: string }>('/billing/upgrade', { method: 'POST' }),
  portal: () => request<{ portal_url: string }>('/billing/portal', { method: 'POST' }),
};

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function availableBalance(w: Wallet): number {
  // Use balance (real deposited money) when present; fall back to budget calculation
  // for list endpoints that may not yet include the balance field.
  return w.balance ?? (w.budget_limit - w.budget_used - w.budget_reserved);
}

export function budgetPercent(w: Wallet): number {
  if (w.budget_limit === 0) return 0;
  return Math.min(100, Math.round((w.budget_used / w.budget_limit) * 100));
}
