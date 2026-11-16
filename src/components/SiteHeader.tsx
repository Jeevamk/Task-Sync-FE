'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './Logo';
import { btn, btnPrimary } from './ui';

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
    <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur-[10px] backdrop-saturate-[1.6]">
      <div className="wrap flex h-16 items-center gap-4">
        <Link href="/" className="inline-flex items-center gap-2.5 text-[17px] font-bold whitespace-nowrap text-fg hover:no-underline" aria-label="Taskvane home">
          <LogoMark />
          Taskvane
        </Link>
        <nav className="ml-auto flex items-center gap-1 overflow-x-auto" aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${l.hideSm ? 'hidden sm:inline-block' : ''} rounded-lg px-2.5 py-1.5 text-[14.5px] font-medium whitespace-nowrap text-fg-soft hover:bg-surface-soft hover:text-fg hover:no-underline aria-[current=page]:bg-surface-soft aria-[current=page]:text-fg`}
              aria-current={isCurrent(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/docs/setup/" className={`${btn} ${btnPrimary} ml-1.5 rounded-lg px-3.5 py-[7px] text-sm whitespace-nowrap`}>
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
