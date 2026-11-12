'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOCS_NAV } from '@/lib/site';

export function DocsNav() {
  const raw = usePathname() ?? '/';
  const path = raw.endsWith('/') ? raw : `${raw}/`;
  return (
    <aside className="docs-nav" aria-label="Documentation">
      <details open>
        <summary>Documentation menu</summary>
        {DOCS_NAV.map((g) => (
          <div key={g.group}>
            <h4>{g.group}</h4>
            <ul>
              {g.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={path === item.href ? 'page' : undefined}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </details>
    </aside>
  );
}
