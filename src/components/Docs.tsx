import Link from 'next/link';
import type { ReactNode } from 'react';
import { slugFor } from '@/lib/slug';
import { DOCS_NAV } from '@/lib/site';
import { tableWrap } from './ui';

const CALLOUT_TONE = {
  info: 'border-brand/30 bg-brand-soft',
  warn: 'border-warn/35 bg-warn-soft',
  ok: 'border-ok/35 bg-ok-soft',
};

export function Callout({ type = 'info', children }: { type?: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const icon = { info: 'ℹ️', warn: '⚠️', ok: '✅' }[type];
  return (
    <div className={`my-5 flex gap-3 rounded-lg border px-4 py-3.5 text-[15px] [&_p:last-child]:mb-0 ${CALLOUT_TONE[type]}`} role="note">
      <span className="flex-none text-lg leading-[1.4]" aria-hidden="true">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}

export function Table({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className={tableWrap}>
      <table>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const pagerLink = 'min-w-[200px] rounded-lg border border-line px-4 py-3 text-fg hover:border-brand hover:no-underline';

/** Previous / next links, from the order in DOCS_NAV. */
export function Pager({ current }: { current: string }) {
  const all = DOCS_NAV.flatMap((g) => g.items);
  const i = all.findIndex((p) => p.href === current);
  const prev = i > 0 ? all[i - 1] : undefined;
  const next = i >= 0 ? all[i + 1] : undefined;
  return (
    <nav className="mt-14 flex flex-wrap justify-between gap-4 border-t border-line pt-6" aria-label="Previous and next page">
      {prev && (
        <Link href={prev.href} className={pagerLink}>
          <small className="block text-fg-faint">← Previous</small>
          {prev.title}
        </Link>
      )}
      {next && (
        <Link href={next.href} className={`${pagerLink} ml-auto text-right`}>
          <small className="block text-fg-faint">Next →</small>
          {next.title}
        </Link>
      )}
    </nav>
  );
}

/** "POST /orgs" in code style, linking to that endpoint in the API reference. */
export function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <Link href={`/docs/api/#${slugFor(method, path)}`} className="whitespace-nowrap">
      <code>
        {method.toUpperCase()} {path}
      </code>
    </Link>
  );
}

/** Page wrapper for a guide page: title, lead paragraph, content, pager. */
export function DocPage({ href, title, lead, children }: { href: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <article className="prose">
      <h1>{title}</h1>
      {lead && <p className="text-lg">{lead}</p>}
      {children}
      <Pager current={href} />
    </article>
  );
}
