'use client';

import { useState } from 'react';

const ENV_VARS = [
  { key: 'API_PORT',          default: '8080',  desc: 'REST API server port' },
  { key: 'MCP_PORT',          default: '8081',  desc: 'MCP server port' },
  { key: 'WEBHOOK_PORT',      default: '8082',  desc: 'Stripe webhook handler port' },
  { key: 'CLAIM_TOKEN_TTL_HOURS', default: '24', desc: 'Claim token expiry' },
  { key: 'WALLET_KEY_TTL_DAYS',   default: '30', desc: 'Wallet key lifetime' },
];

const MCP_TOOLS = [
  { name: 'check_balance',     desc: 'Available balance, status, and policy summary' },
  { name: 'authorize_spend',   desc: 'Request authorization before any purchase' },
  { name: 'list_transactions', desc: 'Recent transaction history' },
  { name: 'get_policy',        desc: 'Full policy — use to self-evaluate before spending' },
];

export default function IntegrationsPage() {
  const [copied, setCopied] = useState('');

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 1500);
    });
  }

  const mcpConfig = JSON.stringify({
    mcpServers: {
      agentpay: {
        url: 'http://localhost:8081/mcp?wallet_key=wk_live_...',
      },
    },
  }, null, 2);

  return (
    <div className="page-enter" style={{ padding: '40px', maxWidth: '720px' }}>

      <div style={{ marginBottom: '36px' }}>
        <p className="label" style={{ marginBottom: '6px' }}>Settings</p>
        <h1 className="display" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Integrations
        </h1>
      </div>

      {/* MCP Integration */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '16px' }}>
          MCP Integration
        </h2>
        <div className="card" style={{ padding: '20px', marginBottom: '12px' }}>
          <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7, marginBottom: '16px' }}>
            Connect any MCP-compatible runtime (Claude Desktop, Cursor, etc.) using a wallet key.
            The agent gets access to 4 tools scoped to that wallet.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            {MCP_TOOLS.map(t => (
              <div key={t.name} style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                <code style={{
                  color: 'var(--green)', fontSize: '11px',
                  minWidth: '160px', flexShrink: 0,
                }}>{t.name}</code>
                <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>{t.desc}</span>
              </div>
            ))}
          </div>

          <p className="label" style={{ marginBottom: '8px' }}>Claude Desktop config</p>
          <div style={{ position: 'relative' }}>
            <pre style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              fontSize: '11px',
              lineHeight: 1.7,
              color: 'var(--text-2)',
              overflowX: 'auto',
              margin: 0,
            }}>{mcpConfig}</pre>
            <button
              onClick={() => copy(mcpConfig, 'mcp')}
              className="btn btn-ghost btn-sm"
              style={{ position: 'absolute', top: '8px', right: '8px' }}
            >
              {copied === 'mcp' ? '✓ copied' : 'copy'}
            </button>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '11px', marginTop: '8px' }}>
            Config file path: <code style={{ color: 'var(--text-2)' }}>~/Library/Application Support/Claude/claude_desktop_config.json</code>
          </p>
        </div>
      </section>

      <hr className="divider" style={{ marginBottom: '40px' }} />

      {/* Server config */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '16px' }}>
          Server Configuration
        </h2>
        <div className="card" style={{ overflow: 'hidden' }}>
          {ENV_VARS.map((v, i) => (
            <div key={v.key} style={{
              display: 'grid',
              gridTemplateColumns: '220px 80px 1fr',
              gap: '16px',
              alignItems: 'center',
              padding: '12px 20px',
              borderBottom: i < ENV_VARS.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <code style={{ color: 'var(--green)', fontSize: '11px' }}>{v.key}</code>
              <span style={{ color: 'var(--text-2)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{v.default}</span>
              <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>{v.desc}</span>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: '11px', marginTop: '10px' }}>
          Set these in <code style={{ color: 'var(--text-2)' }}>agentpay/.env</code>. Defaults are used if unset.
        </p>
      </section>

      <hr className="divider" style={{ marginBottom: '40px' }} />

      {/* Auth info */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '16px' }}>
          API Authentication
        </h2>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p className="label" style={{ marginBottom: '6px' }}>Human endpoints</p>
            <code style={{ color: 'var(--text-2)', fontSize: '11px' }}>Authorization: Bearer &lt;access_token&gt;</code>
            <p style={{ color: 'var(--text-3)', fontSize: '11px', marginTop: '4px' }}>
              JWT access tokens expire after 15 minutes. Use <code style={{ color: 'var(--text-2)' }}>POST /v1/auth/refresh</code> with your refresh token to renew.
            </p>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <p className="label" style={{ marginBottom: '6px' }}>Agent endpoints</p>
            <code style={{ color: 'var(--text-2)', fontSize: '11px' }}>X-Wallet-Key: &lt;wallet_key&gt;</code>
            <p style={{ color: 'var(--text-3)', fontSize: '11px', marginTop: '4px' }}>
              Wallet keys embed the wallet ID and expire after {'{WALLET_KEY_TTL_DAYS}'} days. Rotate via the wallet detail page.
            </p>
          </div>
        </div>
      </section>

      <hr className="divider" style={{ marginBottom: '40px' }} />

      {/* Webhook */}
      <section>
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '16px' }}>
          Stripe Webhook
        </h2>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', marginBottom: '8px' }}>
            <code style={{ color: 'var(--green)', fontSize: '11px', minWidth: '60px' }}>POST</code>
            <code style={{ color: 'var(--text-2)', fontSize: '11px' }}>http://localhost:8082/v1/webhooks/stripe</code>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.7 }}>
            Handles <code style={{ color: 'var(--text-2)' }}>issuing_authorization.request</code> (2s SLA),{' '}
            <code style={{ color: 'var(--text-2)' }}>issuing_authorization.created</code>,{' '}
            <code style={{ color: 'var(--text-2)' }}>issuing_transaction.created</code>,{' '}
            <code style={{ color: 'var(--text-2)' }}>issuing_authorization.updated</code>.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '11px', marginTop: '10px' }}>
            For local testing: <code style={{ color: 'var(--text-2)' }}>stripe listen --forward-to localhost:8082/v1/webhooks/stripe</code>
          </p>
        </div>
      </section>

    </div>
  );
}
