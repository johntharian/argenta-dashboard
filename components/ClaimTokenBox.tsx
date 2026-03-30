'use client';

import { useState } from 'react';

interface Props {
  token: string;
  onDismiss?: () => void;
}

export default function ClaimTokenBox({ token, onDismiss }: Props) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      background: 'var(--green-dim)',
      border: '1px solid var(--green)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--green)', fontWeight: 500 }}>
          Claim token — share with your agent
        </span>
        {onDismiss && (
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '14px' }}>
            ×
          </button>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--bg)', borderRadius: 'var(--radius)',
        padding: '10px 14px', border: '1px solid var(--border)',
      }}>
        <code style={{
          flex: 1, fontFamily: 'var(--font-mono)',
          fontSize: '14px', fontWeight: 600,
          letterSpacing: '0.08em', color: 'var(--green)',
        }}>
          {token}
        </code>
        <button className="btn btn-ghost btn-sm" onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <p style={{ color: 'var(--text-2)', fontSize: '11px', marginTop: '10px', lineHeight: 1.6 }}>
        Paste this token into your agent's system prompt or config. It can only be used once and expires in 24 hours.
        Your agent will exchange it for a wallet key automatically.
      </p>
    </div>
  );
}
