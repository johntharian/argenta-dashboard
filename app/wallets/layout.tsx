'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const NAV = [
  { href: '/wallets', label: 'Wallets', icon: '◈' },
  { href: '/wallets/settings', label: 'Settings', icon: '◎' },
  { href: '/wallets/integrations', label: 'Integrations', icon: '◌' },
];

function getToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
    } else {
      setAuthed(true);
    }
  }, [router]);

  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  if (!authed) return null;

  function logout() {
    document.cookie = 'access_token=; max-age=0; path=/';
    document.cookie = 'refresh_token=; max-age=0; path=/';
    router.push('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        opacity: 0.4,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Sidebar */}
      <aside style={{
        width: '200px',
        flexShrink: 0,
        background: 'var(--bg-1)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 22, height: 22,
              background: 'var(--green)',
              borderRadius: '3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4v6l-6 3L1 10V4L7 1z" fill="#000"/>
              </svg>
            </div>
            <span className="display" style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '-0.01em' }}>
              AgentPay
            </span>
          </div>
        </div>

        <hr className="divider" style={{ marginBottom: '16px' }} />

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px', flex: 1 }}>
          {NAV.map(item => {
            const active = item.href === '/wallets'
              ? pathname === '/wallets' || (pathname.startsWith('/wallets/') && !pathname.startsWith('/wallets/settings') && !pathname.startsWith('/wallets/integrations'))
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${active ? ' active' : ''}`}
              >
                <span style={{ fontSize: '10px', opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px 0' }}>
          <hr className="divider" style={{ marginBottom: '16px' }} />
          <button onClick={logout} className="nav-signout">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main key={pathname} ref={mainRef} style={{ marginLeft: '200px', flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
