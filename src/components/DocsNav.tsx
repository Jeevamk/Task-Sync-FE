'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOCS_NAV } from '@/lib/site';

export function DocsNav() {
  const raw = usePathname() ?? '/';
  const path = raw.endsWith('/') ? raw : `${raw}/`;
  return (
    <aside
      className="text-[14.5px] lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-110px)] lg:self-start lg:overflow-y-auto"
      aria-label="Documentation"
    >
      <details open className="rounded-lg border border-line bg-surface-soft px-3.5 py-2.5 lg:border-0 lg:bg-transparent lg:p-0">
        <summary className="cursor-pointer font-semibold lg:hidden">Documentation menu</summary>
        {DOCS_NAV.map((g) => (
          <div key={g.group}>
            <h4 className="mt-5 mb-2 text-xs tracking-[0.1em] text-fg-faint uppercase">{g.group}</h4>
            <ul>
              {g.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={path === item.href ? 'page' : undefined}
                    className="block rounded-md border-l-2 border-transparent px-2.5 py-[5px] text-fg-soft hover:bg-surface-soft hover:text-fg hover:no-underline aria-[current=page]:bg-brand-soft aria-[current=page]:font-semibold aria-[current=page]:text-brand"
                  >
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
