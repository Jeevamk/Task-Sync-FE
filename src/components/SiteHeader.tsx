'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './Logo';

const LINKS = [
  { href: '/#how-it-works', label: 'How it works', hideSm: true },
  { href: '/#features', label: 'Features', hideSm: true },
  { href: '/docs/', label: 'Docs' },
  { href: '/docs/api/', label: 'API' },
];

export function SiteHeader() {
  const path = usePathname() ?? '/';
  const isCurrent = (href: string) => {
    if (href === '/docs/') return path.startsWith('/docs') && !path.startsWith('/docs/api');
    if (href === '/docs/api/') return path.startsWith('/docs/api');
    return false;
  };
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo" aria-label="Task Sync home">
          <LogoMark />
          Task Sync
        </Link>
        <nav className="nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={l.hideSm ? 'nav-hide-sm' : undefined} aria-current={isCurrent(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          <Link href="/docs/setup/" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 14 }}>
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
