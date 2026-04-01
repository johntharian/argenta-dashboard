import Link from 'next/link';

const STEPS = [
  { n: '01', text: 'Register an account and create a wallet with a hard budget and spending policies' },
  { n: '02', text: 'Generate a one-time claim token and pass it to your agent via system prompt' },
  { n: '03', text: 'The agent securely claims the wallet via MCP to receive a persistent wallet key' },
  { n: '04', text: 'For each purchase, the agent requests spend authorization for a specific merchant and amount' },
  { n: '05', text: 'AgentPay evaluates the request against your custom rules. If approved, it provisions a single-use virtual card scoped exactly to that purchase' },
  { n: '06', text: 'The card auto-expires in 5 minutes. Working out-of-the-box with any merchant while guaranteeing zero exposure' },
];

const FEATURES = [
  { icon: '◈', label: 'Scoped budgets', desc: 'Per-agent limits: daily, weekly, per-transaction, total budget' },
  { icon: '◉', label: 'Instant freeze', desc: 'Revoke any wallet immediately. Cascades to all child wallets' },
  { icon: '■', label: 'No card exposure', desc: 'Agents never see card numbers. Only a scoped key and a budget' },
  { icon: '◇', label: 'Delegation tree', desc: 'Wallet can delegate a slice of its budget to a child agent' },
  { icon: '○', label: 'MCP-native', desc: 'Claude, Cursor, and any MCP runtime connect out of the box' },
  { icon: '□', label: 'Alert on every spend', desc: 'Threshold alerts, budget warnings, and approval hooks' },
];

const USE_CASES = [
  {
    icon: '◈',
    title: 'Autonomous Procurement',
    description: 'Provide an AI agent with a $500 monthly budget specifically for purchasing AWS, Vercel, or cloud API credits without needing your credit card.'
  },
  {
    icon: '◉',
    title: 'Customer Support Refunds',
    description: 'Empower support bots to issue refunds or tiny appeasements directly to users while governed by a strict $20 daily cap.'
  },
  {
    icon: '◎',
    title: 'Marketing & Ad Spend',
    description: 'Let growth agents autonomously test and scale campaigns, halting spend immediately when alert thresholds are hit.'
  },
  {
    icon: '◆',
    title: 'Personal AI Concierge',
    description: 'Allow your personal assistant to book flights, reserve hotels, or order food deliveries with a strict allowance and merchant category locks.'
  },
  {
    icon: '◇',
    title: 'Data & Research Acquisition',
    description: 'Enable research agents to seamlessly bypass API paywalls, purchase gated datasets, or buy premium industry reports autonomously.'
  },
  {
    icon: '◐',
    title: 'Automated E-commerce',
    description: 'Give purchasing bots the ability to execute inventory buy-orders across different suppliers using a unique 5-minute virtual card per checkout.'
  }
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-mono)', position: 'relative', overflow: 'hidden' }}>

      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        opacity: 0.4,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Content above grid */}
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Nav */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, isolation: 'isolate',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(8,11,8,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '52px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 20, height: 20,
            background: 'var(--green)', borderRadius: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4v6l-6 3L1 10V4L7 1z" fill="#000"/>
            </svg>
          </div>
          <span className="display" style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '-0.01em' }}>
            AgentPay
          </span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link href="#how-it-works" className="nav-link" style={{ fontSize: '13px', fontWeight: 500 }}>How it works</Link>
          <Link href="#use-cases" className="nav-link" style={{ fontSize: '13px', fontWeight: 500 }}>Use cases</Link>
          <Link href="#features" className="nav-link" style={{ fontSize: '13px', fontWeight: 500 }}>Features</Link>
        </nav>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        paddingTop: '140px', paddingBottom: '100px',
        paddingLeft: '32px', paddingRight: '32px',
        maxWidth: '760px', margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Tag */}
        <div className="page-enter" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '4px 12px',
          background: 'var(--green-dim)',
          border: '1px solid rgba(61,255,130,0.2)',
          borderRadius: '2px',
          marginBottom: '32px',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--green)',
            animation: 'pulse-dot 2.5s infinite',
            flexShrink: 0,
          }} />
          <span style={{ color: 'var(--green)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
            Financial infrastructure for AI agents
          </span>
        </div>

        <h1 className="display page-enter page-enter-delay-1" style={{
          fontSize: 'clamp(32px, 6vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          marginBottom: '24px',
        }}>
          Give your agent a wallet,<br/>
          <span style={{ color: 'var(--green)' }}>not your card</span>
        </h1>

        <p className="page-enter page-enter-delay-2" style={{
          fontSize: '15px',
          lineHeight: 1.75,
          color: 'var(--text-2)',
          maxWidth: '540px',
          margin: '0 auto 40px',
        }}>
          AgentPay is a financial proxy for AI agents. You set the budget and the rules.
          The agent gets a scoped key. It can spend real money — you can freeze it instantly.
        </p>

        <div className="page-enter page-enter-delay-3" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="btn btn-primary" style={{ fontSize: '12px', padding: '10px 20px' }}>
            Create your first wallet →
          </Link>
          <Link href="/login" className="btn btn-ghost" style={{ fontSize: '12px', padding: '10px 20px' }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }}>
        <hr className="divider" />
      </div>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 32px' }}>
        <p className="label" style={{ marginBottom: '32px', textAlign: 'center' }}>How it works</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {STEPS.map((s, i) => (
            <div key={s.n} className={`page-enter page-enter-delay-${i + 1}`} style={{
              display: 'flex', gap: '20px', alignItems: 'flex-start',
              padding: '20px 0',
              borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--green)',
                letterSpacing: '0.08em',
                fontWeight: 600,
                minWidth: '28px',
                paddingTop: '1px',
              }}>{s.n}</span>
              <span style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.6 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }}>
        <hr className="divider" />
      </div>

      {/* Use Cases */}
      <section id="use-cases" style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 32px' }}>
        <p className="label" style={{ marginBottom: '32px', textAlign: 'center' }}>Use cases</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}>
          {USE_CASES.map((u, i) => (
            <div key={u.title} className={`page-enter page-enter-delay-${i + 1} wallet-card`} style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            }}>
              {/* Graphic Header */}
              <div style={{
                height: '110px',
                background: 'linear-gradient(180deg, rgba(61,255,130,0.1) 0%, transparent 100%)',
                position: 'relative',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: '16px',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'radial-gradient(circle at center, rgba(61,255,130,0.15) 1px, transparent 1px)',
                  backgroundSize: '12px 12px', opacity: 0.5,
                }} />
                
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--bg-2)',
                  boxShadow: '0 4px 12px rgba(61,255,130,0.05)',
                  border: '1px solid rgba(61,255,130,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--green)', fontSize: '18px',
                  position: 'relative', zIndex: 1
                }}>
                  {u.icon}
                </div>
              </div>
              
              {/* Content */}
              <div style={{ padding: '0 24px 32px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '15px', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                  {u.title}
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  {u.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }}>
        <hr className="divider" />
      </div>

      {/* Features */}
      <section id="features" style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 32px 24px' }}>
        <p className="label" style={{ marginBottom: '32px', textAlign: 'center' }}>Features</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}>
          {FEATURES.map((f, i) => (
            <div key={f.label} className={`page-enter page-enter-delay-${i + 1} wallet-card`} style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            }}>
              {/* Graphic Header */}
              <div style={{
                height: '110px',
                background: 'linear-gradient(180deg, rgba(61,255,130,0.1) 0%, transparent 100%)',
                position: 'relative',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: '16px',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'radial-gradient(circle at center, rgba(61,255,130,0.15) 1px, transparent 1px)',
                  backgroundSize: '12px 12px', opacity: 0.5,
                }} />
                
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--bg-2)',
                  boxShadow: '0 4px 12px rgba(61,255,130,0.05)',
                  border: '1px solid rgba(61,255,130,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--green)', fontSize: '18px',
                  position: 'relative', zIndex: 1
                }}>
                  {f.icon}
                </div>
              </div>
              
              {/* Content */}
              <div style={{ padding: '0 24px 32px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '15px', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                  {f.label}
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Policy engine callout */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 32px 80px' }}>
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center',
        }}>
          <div>
            <p className="label" style={{ marginBottom: '16px' }}>Dual-gate security</p>
            <h2 className="display" style={{
              fontSize: '24px', fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text)', marginBottom: '16px', lineHeight: 1.2,
            }}>
              Every spend runs the rules twice
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.75, marginBottom: '24px' }}>
              Your policy engine fires on every <code style={{ color: 'var(--green)', fontSize: '11px' }}>/authorize</code> call.
              The same rules run again on the Stripe webhook — independently, before the card network settles.
              Two gates. Neither trusts the other.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Wallet must be active', 'Amount ≤ max single spend', 'Daily + weekly totals enforced', 'MCC allowlist + merchant blocklist', 'Budget exhaustion check', 'Reason required if configured'].map(rule => (
                <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--green)', fontSize: '10px' }}>✓</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: 1.8,
          }}>
            <div style={{ color: 'var(--text-3)', marginBottom: '4px' }}># agent calls authorize</div>
            <div style={{ color: 'var(--text-2)' }}>POST /v1/authorize</div>
            <div style={{ color: 'var(--text-3)', margin: '12px 0 4px' }}># policy engine</div>
            <div style={{ color: 'var(--green)' }}>✓ status: active</div>
            <div style={{ color: 'var(--green)' }}>✓ amount: within limits</div>
            <div style={{ color: 'var(--green)' }}>✓ daily: $42 / $200</div>
            <div style={{ color: 'var(--green)' }}>✓ merchant: allowed</div>
            <div style={{ color: 'var(--text-3)', margin: '12px 0 4px' }}># stripe webhook (2s SLA)</div>
            <div style={{ color: 'var(--green)' }}>✓ second gate passes</div>
            <div style={{ color: 'var(--text-3)', margin: '12px 0 4px' }}># result</div>
            <div style={{ color: 'var(--text)', fontWeight: 500 }}>
              approved <span style={{ color: 'var(--green)' }}>→</span> spend_token issued
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: '900px', margin: '0 auto',
        padding: '80px 32px 120px',
        textAlign: 'center',
      }}>
        <h2 className="display" style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--text)', marginBottom: '16px',
        }}>
          Start with one wallet
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '13px', marginBottom: '32px' }}>
          Create an account, set a budget, and paste the claim token into your agent.
        </p>
        <Link href="/signup" className="btn btn-primary" style={{ fontSize: '12px', padding: '11px 24px' }}>
          Create account →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '900px', margin: '0 auto',
      }}>
        <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>AgentPay</span>
        <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>
          Backed by Stripe Issuing
        </span>
      </footer>

      </div>{/* end content wrapper */}
    </div>
  );
}
